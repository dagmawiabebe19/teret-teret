import { NextResponse } from "next/server";
import { z } from "zod";
import { synthesizeAmharicSpeech, isAzureSpeechConfigured } from "@/lib/azureSpeech";
import { synthesizeSpeech, isElevenLabsConfigured } from "@/lib/elevenlabs";
import { ttsCacheKey, ttsStoragePath } from "@/lib/ttsCache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOptionalUser } from "@/lib/supabase/server";
import { resolveProfileAccess } from "@/lib/profileAccess";

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

  if (lang === "am") {
    if (!isAzureSpeechConfigured()) {
      return NextResponse.json(
        { error: "Amharic premium narration is not configured", useBrowserTts: true },
        { status: 503 }
      );
    }
  } else if (!isElevenLabsConfigured()) {
    return NextResponse.json(
      { error: "Premium narration is not configured", useBrowserTts: true },
      { status: 503 }
    );
  }

  const { user } = await getOptionalUser();
  if (!user) {
    return NextResponse.json(
      { error: "Sign in required for premium narration", useBrowserTts: true },
      { status: 401 }
    );
  }

  const supabase = await import("@/lib/supabase/server").then((m) => m.createClient());
  if (!supabase) {
    return NextResponse.json({ error: "Auth unavailable", useBrowserTts: true }, { status: 503 });
  }

  const access = await resolveProfileAccess(user.id, request);
  if (!access.hasFullAccess) {
    return NextResponse.json(
      { error: "Premium narration is for subscribers", useBrowserTts: true },
      { status: 403 }
    );
  }

  const key = ttsCacheKey(text, lang);
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

  try {
    const audio =
      lang === "am" ? await synthesizeAmharicSpeech(text) : await synthesizeSpeech(text, lang);
    const upload = await admin.storage.from("tts-cache").upload(path, audio, {
      contentType: "audio/mpeg",
      upsert: true,
    });
    if (upload.error) {
      console.error("[tts] cache upload failed", upload.error);
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
