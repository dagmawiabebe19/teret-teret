import { NextResponse } from "next/server";
import { z } from "zod";
import {
  isAzureSpeechConfigured,
  synthesizeAmharicSpeech,
  synthesizeEnglishSpeech,
} from "@/lib/azureSpeech";
import { getOptionalUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveProfileAccess } from "@/lib/profileAccess";
import { canUsePremiumNarration } from "@/lib/access";
import { checkTtsBudget, recordTtsUsage } from "@/lib/ttsUsageDaily";
import { ttsCacheKey, ttsStoragePath } from "@/lib/ttsCache";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Lives-only TTS wrapper. Uses Azure for Amharic narration and English phrase
 * pronunciation. Does not alter /api/tts (bedtime stories path).
 */
const Schema = z.object({
  text: z.string().min(1).max(5000),
  lang: z.enum(["am", "en"]),
});

const AUDIO_UNAVAILABLE =
  "Audio temporarily unavailable. Please try again in a moment.";

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

  if (!isAzureSpeechConfigured()) {
    return NextResponse.json(
      { error: "Azure narration is not configured", useBrowserTts: true },
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

  const { text, lang } = parsed.data;
  const trimmed = text.trim();
  const access = await resolveProfileAccess(user.id, request);

  const cacheLang = lang === "am" ? "am" : "en";
  const key = ttsCacheKey(`lives:${trimmed}`, cacheLang);
  const path = ttsStoragePath(cacheLang, key);

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: AUDIO_UNAVAILABLE, audioUnavailable: true },
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
          "X-TTS-Provider": "azure",
          "X-TTS-Feature": "lives",
        },
      });
    }
  } catch (cacheErr) {
    console.warn("[lives/tts] cache download error", cacheErr);
  }

  const budget = await checkTtsBudget(admin, user.id, trimmed.length, access.hasFullAccess);
  if (!budget.allowed) {
    return NextResponse.json(
      {
        error: "Daily audio limit reached. Upgrade to Premium for unlimited.",
        ttsDailyLimit: true,
      },
      { status: 429 }
    );
  }

  try {
    const audio =
      lang === "am"
        ? await synthesizeAmharicSpeech(trimmed)
        : await synthesizeEnglishSpeech(trimmed);

    try {
      const upload = await admin.storage.from("tts-cache").upload(path, audio, {
        contentType: "audio/mpeg",
        upsert: true,
      });
      if (upload.error) console.error("[lives/tts] cache upload failed", upload.error);
    } catch (uploadErr) {
      console.error("[lives/tts] cache upload threw", uploadErr);
    }

    if (!access.hasFullAccess) {
      await recordTtsUsage(admin, user.id, trimmed.length);
    }

    return new NextResponse(audio, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-TTS-Cache": "miss",
        "X-TTS-Provider": "azure",
        "X-TTS-Feature": "lives",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[lives/tts] Azure synthesis failed", message);
    return NextResponse.json(
      { error: AUDIO_UNAVAILABLE, audioUnavailable: true },
      { status: 503 }
    );
  }
}
