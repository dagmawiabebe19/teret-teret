import { NextResponse } from "next/server";
import { z } from "zod";
import { synthesizeAmharicSpeech, isAzureSpeechConfigured } from "@/lib/azureSpeech";
import { synthesizeSpeech, isElevenLabsConfigured } from "@/lib/elevenlabs";
import { ttsCacheKey, ttsStoragePath } from "@/lib/ttsCache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOptionalUser } from "@/lib/supabase/server";
import { resolveProfileAccess } from "@/lib/profileAccess";
import { canUsePremiumNarration } from "@/lib/access";
import { checkTtsBudget, recordTtsUsage } from "@/lib/ttsUsageDaily";

export const dynamic = "force-dynamic";

const TtsSchema = z.object({
  text: z.string().min(1).max(5000),
  lang: z.enum(["am", "en", "es"]),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = TtsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { text, lang } = parsed.data;
  const trimmed = text.trim();

  if (lang === "am") {
    if (!isAzureSpeechConfigured()) {
      return NextResponse.json(
        { error: "Amharic AI narration is not configured", useBrowserTts: true },
        { status: 503 }
      );
    }
  } else if (!isElevenLabsConfigured()) {
    return NextResponse.json(
      { error: "AI narration is not configured", useBrowserTts: true },
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

  const access = await resolveProfileAccess(user.id, request);

  const key = ttsCacheKey(trimmed, lang);
  const path = ttsStoragePath(lang, key);

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Storage unavailable", useBrowserTts: true }, { status: 503 });
  }

  const { data: cached, error: downloadError } = await admin.storage.from("tts-cache").download(path);
  if (cached && !downloadError) {
    const buffer = await cached.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-TTS-Cache": "hit",
        "X-TTS-Provider": lang === "am" ? "azure" : "elevenlabs",
      },
    });
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
      lang === "am" ? await synthesizeAmharicSpeech(trimmed) : await synthesizeSpeech(trimmed, lang);
    const upload = await admin.storage.from("tts-cache").upload(path, audio, {
      contentType: "audio/mpeg",
      upsert: true,
    });
    if (upload.error) {
      console.error("[tts] cache upload failed", upload.error);
    }

    if (!access.hasFullAccess) {
      await recordTtsUsage(admin, user.id, trimmed.length);
    }

    return new NextResponse(audio, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-TTS-Cache": "miss",
        "X-TTS-Provider": lang === "am" ? "azure" : "elevenlabs",
      },
    });
  } catch (err) {
    const provider = lang === "am" ? "Azure" : "ElevenLabs";
    console.error(`[tts] ${provider} synthesis failed`, err);
    return NextResponse.json(
      { error: "Could not generate narration", useBrowserTts: true },
      { status: 502 }
    );
  }
}
