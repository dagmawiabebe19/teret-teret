import { NextResponse } from "next/server";
import { z } from "zod";
import {
  isAzureSpeechConfigured,
  synthesizeEnglishSpeech,
} from "@/lib/azureSpeech";
import {
  isElevenLabsConfigured,
  synthesizeSpeech,
} from "@/lib/elevenlabs";
import { getOptionalUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveProfileAccess } from "@/lib/profileAccess";
import { canUsePremiumNarration } from "@/lib/access";
import { checkTtsBudget, recordTtsUsage } from "@/lib/ttsUsageDaily";
import { ttsCacheKey, ttsStoragePath } from "@/lib/ttsCache";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Practice English TTS.
 * Prefer the same English path as bedtime /api/tts (ElevenLabs).
 * Fall back to Azure English only if ElevenLabs is not configured.
 * Does not modify /api/tts or Lives.
 */
const Schema = z.object({
  text: z.string().min(1).max(2000),
});

const AUDIO_UNAVAILABLE =
  "Couldn't play audio — you can still read the reply.";

function logPracticeTtsEnv(): void {
  const azureKey = process.env.AZURE_SPEECH_KEY?.trim() ?? "";
  const azureRegion = process.env.AZURE_SPEECH_REGION?.trim() ?? "";
  const azureEndpoint = process.env.AZURE_SPEECH_ENDPOINT?.trim() ?? "";
  const azureVoiceEn = process.env.AZURE_VOICE_EN?.trim() ?? "";
  const elevenKey = process.env.ELEVENLABS_API_KEY?.trim() ?? "";
  const elevenVoiceEn = process.env.ELEVENLABS_VOICE_EN?.trim() ?? "";

  console.log("[practice/tts] env check:", {
    hasAzureKey: Boolean(azureKey),
    azureKeyEmptyString: process.env.AZURE_SPEECH_KEY === "",
    hasAzureRegion: Boolean(azureRegion),
    azureRegion: azureRegion || null,
    hasAzureEndpoint: Boolean(azureEndpoint),
    azureEndpointEmptyString: process.env.AZURE_SPEECH_ENDPOINT === "",
    azureEndpointHost: azureEndpoint
      ? (() => {
          try {
            return new URL(
              azureEndpoint.includes("://")
                ? azureEndpoint
                : `https://${azureEndpoint}`
            ).host;
          } catch {
            return "(unparseable)";
          }
        })()
      : null,
    hasAzureVoiceEn: Boolean(azureVoiceEn),
    azureVoiceEn: azureVoiceEn || "en-US-JennyNeural (default)",
    hasElevenLabsKey: Boolean(elevenKey),
    elevenLabsKeyEmptyString: process.env.ELEVENLABS_API_KEY === "",
    hasElevenLabsVoiceEn: Boolean(elevenVoiceEn),
    elevenLabsConfigured: isElevenLabsConfigured(),
    azureConfigured: isAzureSpeechConfigured(),
  });
}

function logPracticeTtsError(err: unknown, phase: string): void {
  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : undefined;
  const extra =
    err && typeof err === "object"
      ? {
          name: (err as { name?: string }).name,
          status: (err as { status?: number }).status,
          body: (err as { body?: unknown }).body,
        }
      : {};
  console.error(`[practice/tts] error: ${phase}`, {
    message,
    stack,
    ...extra,
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  logPracticeTtsEnv();

  const elevenOk = isElevenLabsConfigured();
  const azureOk = isAzureSpeechConfigured();
  if (!elevenOk && !azureOk) {
    console.error(
      "[practice/tts] error: neither ElevenLabs nor Azure TTS is configured"
    );
    return NextResponse.json(
      {
        error: AUDIO_UNAVAILABLE,
        useBrowserTts: true,
        audioUnavailable: true,
      },
      { status: 503 }
    );
  }

  const { user } = await getOptionalUser();
  if (!user || !canUsePremiumNarration(user.id)) {
    return NextResponse.json(
      { error: "Sign in for AI narration", useBrowserTts: true },
      { status: 401 }
    );
  }

  const trimmed = parsed.data.text.trim();
  const access = await resolveProfileAccess(user.id, request);
  const key = ttsCacheKey(`practice:${trimmed}`, "en");
  const path = ttsStoragePath("en", key);
  const admin = createAdminClient();
  if (!admin) {
    console.error("[practice/tts] error: admin client / Supabase not configured");
    return NextResponse.json(
      { error: AUDIO_UNAVAILABLE, audioUnavailable: true, useBrowserTts: true },
      { status: 503 }
    );
  }

  try {
    const { data: cached, error: downloadError } = await admin.storage
      .from("tts-cache")
      .download(path);
    if (cached && !downloadError) {
      return new NextResponse(await cached.arrayBuffer(), {
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "public, max-age=31536000, immutable",
          "X-TTS-Cache": "hit",
          "X-TTS-Feature": "practice",
        },
      });
    }
  } catch (cacheErr) {
    console.warn("[practice/tts] cache download error", cacheErr);
  }

  const budget = await checkTtsBudget(
    admin,
    user.id,
    trimmed.length,
    access.hasFullAccess
  );
  if (!budget.allowed) {
    return NextResponse.json(
      {
        error: "Daily audio limit reached. Upgrade to Premium for unlimited.",
        ttsDailyLimit: true,
      },
      { status: 429 }
    );
  }

  // Match bedtime /api/tts English: ElevenLabs first (known-good path).
  let provider: "elevenlabs" | "azure" = elevenOk ? "elevenlabs" : "azure";
  try {
    let audio: ArrayBuffer;
    if (elevenOk) {
      console.log("[practice/tts] synthesizing via ElevenLabs (bedtime parity)");
      try {
        audio = await synthesizeSpeech(trimmed, "en");
      } catch (elevenErr) {
        logPracticeTtsError(elevenErr, "ElevenLabs synthesis failed");
        if (!azureOk) throw elevenErr;
        console.warn("[practice/tts] falling back to Azure English voice");
        provider = "azure";
        audio = await synthesizeEnglishSpeech(trimmed);
      }
    } else {
      console.log("[practice/tts] synthesizing via Azure English (ElevenLabs not configured)");
      audio = await synthesizeEnglishSpeech(trimmed);
    }

    try {
      const upload = await admin.storage.from("tts-cache").upload(path, audio, {
        contentType: "audio/mpeg",
        upsert: true,
      });
      if (upload.error) {
        console.error("[practice/tts] cache upload failed", upload.error);
      }
    } catch (uploadErr) {
      console.error("[practice/tts] cache upload threw", uploadErr);
    }

    if (!access.hasFullAccess) {
      await recordTtsUsage(admin, user.id, trimmed.length);
    }

    return new NextResponse(audio, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-TTS-Cache": "miss",
        "X-TTS-Provider": provider,
        "X-TTS-Feature": "practice",
      },
    });
  } catch (err) {
    logPracticeTtsError(err, `${provider} synthesis failed`);
    return NextResponse.json(
      {
        error: AUDIO_UNAVAILABLE,
        audioUnavailable: true,
        useBrowserTts: true,
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 503 }
    );
  }
}
