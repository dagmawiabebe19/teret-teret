import { NextResponse } from "next/server";
import { z } from "zod";
import { synthesizeSpeech, isElevenLabsConfigured } from "@/lib/elevenlabs";
import { ttsCacheKey, ttsStoragePath } from "@/lib/ttsCache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOptionalUser } from "@/lib/supabase/server";
import { isPremiumStatus } from "@/lib/premium";

export const dynamic = "force-dynamic";

const TtsSchema = z.object({
  text: z.string().min(1).max(5000),
  lang: z.enum(["am", "en", "es"]),
});

export async function POST(request: Request) {
  if (!isElevenLabsConfigured()) {
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", user.id)
    .single();

  if (!isPremiumStatus(profile?.subscription_status)) {
    return NextResponse.json(
      { error: "Premium narration is for subscribers", useBrowserTts: true },
      { status: 403 }
    );
  }

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
      },
    });
  }

  try {
    const audio = await synthesizeSpeech(text, lang);
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
      },
    });
  } catch (err) {
    console.error("[tts] ElevenLabs synthesis failed", err);
    return NextResponse.json(
      { error: "Could not generate narration", useBrowserTts: true },
      { status: 502 }
    );
  }
}
