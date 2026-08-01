import { NextResponse } from "next/server";
import { z } from "zod";
import {
  isAzureSpeechConfigured,
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
 * Practice English TTS — Azure English voice only.
 * Reuses azureSpeech.synthesizeEnglishSpeech; does not alter /api/tts or Lives.
 */
const Schema = z.object({
  text: z.string().min(1).max(2000),
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

  const trimmed = parsed.data.text.trim();
  const access = await resolveProfileAccess(user.id, request);
  const key = ttsCacheKey(`practice:${trimmed}`, "en");
  const path = ttsStoragePath("en", key);
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

  try {
    const audio = await synthesizeEnglishSpeech(trimmed);
    try {
      await admin.storage.from("tts-cache").upload(path, audio, {
        contentType: "audio/mpeg",
        upsert: true,
      });
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
        "X-TTS-Feature": "practice",
      },
    });
  } catch (err) {
    console.error("[practice/tts]", err);
    return NextResponse.json(
      { error: AUDIO_UNAVAILABLE, audioUnavailable: true },
      { status: 503 }
    );
  }
}
