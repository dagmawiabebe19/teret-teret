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
 * Practice English TTS — mirrors bedtime /api/tts English branch:
 * same ELEVENLABS_API_KEY, voice (ELEVENLABS_VOICE_EN / default), model,
 * synthesizeSpeech("en"), and raw audio/mpeg bytes response.
 */
const Schema = z.object({
  text: z.string().min(1).max(5000),
});

const AUDIO_UNAVAILABLE =
  "Couldn't play audio — you can still read the reply.";

/** Same default as lib/elevenlabs.ts for English. */
const BEDTIME_DEFAULT_VOICE_EN = "EXAVITQu4vr4xnSDxMaL";
const BEDTIME_DEFAULT_MODEL = "eleven_multilingual_v2";

function logPracticeTtsEnv(): {
  hasElevenKey: boolean;
  voiceId: string;
  modelId: string;
} {
  const elevenKey = process.env.ELEVENLABS_API_KEY?.trim() ?? "";
  const voiceId =
    process.env.ELEVENLABS_VOICE_EN?.trim() || BEDTIME_DEFAULT_VOICE_EN;
  const modelId =
    process.env.ELEVENLABS_MODEL_ID?.trim() || BEDTIME_DEFAULT_MODEL;
  const azureKey = process.env.AZURE_SPEECH_KEY?.trim() ?? "";
  const azureRegion = process.env.AZURE_SPEECH_REGION?.trim() ?? "";
  const azureEndpoint = process.env.AZURE_SPEECH_ENDPOINT?.trim() ?? "";

  const snapshot = {
    hasElevenKey: Boolean(elevenKey),
    elevenKeyEmptyString: process.env.ELEVENLABS_API_KEY === "",
    hasElevenLabsVoiceEn: Boolean(process.env.ELEVENLABS_VOICE_EN?.trim()),
    voiceId,
    modelId,
    elevenLabsConfigured: isElevenLabsConfigured(),
    hasAzureKey: Boolean(azureKey),
    hasAzureRegion: Boolean(azureRegion),
    azureRegion: azureRegion || null,
    hasAzureEndpoint: Boolean(azureEndpoint),
    azureConfigured: isAzureSpeechConfigured(),
  };
  console.log("[practice/tts] env check:", snapshot);
  return { hasElevenKey: snapshot.hasElevenKey, voiceId, modelId };
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

  const { hasElevenKey, voiceId, modelId } = logPracticeTtsEnv();

  const elevenOk = isElevenLabsConfigured();
  const azureOk = isAzureSpeechConfigured();
  if (!elevenOk && !azureOk) {
    console.error(
      "[practice/tts] error: neither ElevenLabs nor Azure configured",
      { hasElevenKey }
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

  // Same cache key shape as bedtime for English (no practice: prefix collision risk
  // with different synthesis — keep practice prefix but same lang/path helper).
  const key = ttsCacheKey(`practice:${trimmed}`, "en");
  const path = ttsStoragePath("en", key);
  const admin = createAdminClient();
  if (!admin) {
    console.error("[practice/tts] error: Supabase admin client missing");
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
      const buffer = await cached.arrayBuffer();
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "public, max-age=31536000, immutable",
          "X-TTS-Cache": "hit",
          "X-TTS-Provider": "elevenlabs",
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

  let provider: "elevenlabs" | "azure" = elevenOk ? "elevenlabs" : "azure";
  try {
    let audio: ArrayBuffer;

    if (elevenOk) {
      console.log("[practice/tts] ElevenLabs request (bedtime parity):", {
        hasElevenKey,
        voiceId,
        modelId,
        textChars: trimmed.length,
        endpoint: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      });
      try {
        // Identical call bedtime /api/tts uses for lang === "en"
        audio = await synthesizeSpeech(trimmed, "en");
        console.log("[practice/tts] ElevenLabs OK, bytes:", audio.byteLength);
      } catch (elevenErr) {
        const message =
          elevenErr instanceof Error ? elevenErr.message : String(elevenErr);
        console.error("[practice/tts] error: ElevenLabs synthesis failed", {
          hasElevenKey,
          voiceId,
          modelId,
          message,
          status: (elevenErr as { status?: number })?.status,
          body: (elevenErr as { body?: unknown })?.body,
        });
        if (!azureOk) throw elevenErr;
        console.warn("[practice/tts] falling back to Azure English");
        provider = "azure";
        audio = await synthesizeEnglishSpeech(trimmed);
      }
    } else {
      console.log("[practice/tts] ElevenLabs not configured; using Azure English");
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

    // Same response shape as bedtime /api/tts: raw audio/mpeg bytes
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
