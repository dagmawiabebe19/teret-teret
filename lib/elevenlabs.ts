import type { Lang } from "@/types";

const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech";

/** Warm storyteller voices — override via env for your ElevenLabs account. */
const DEFAULT_VOICES: Record<Lang, string> = {
  en: "EXAVITQu4vr4xnSDxMaL", // Sarah — clear, warm
  es: "EXAVITQu4vr4xnSDxMaL", // multilingual v2
  am: "EXAVITQu4vr4xnSDxMaL", // multilingual v2 for Amharic
};

const MODEL_ID = "eleven_multilingual_v2";

export function isElevenLabsConfigured(): boolean {
  return Boolean(process.env.ELEVENLABS_API_KEY?.trim());
}

function voiceIdForLang(lang: Lang): string {
  const envKey =
    lang === "am"
      ? process.env.ELEVENLABS_VOICE_AM
      : lang === "es"
        ? process.env.ELEVENLABS_VOICE_ES
        : process.env.ELEVENLABS_VOICE_EN;
  return envKey?.trim() || DEFAULT_VOICES[lang];
}

export async function synthesizeSpeech(text: string, lang: Lang): Promise<ArrayBuffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is not set");
  }

  const voiceId = voiceIdForLang(lang);
  const res = await fetch(`${ELEVENLABS_API_URL}/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: text.trim(),
      model_id: MODEL_ID,
      voice_settings: {
        stability: 0.45,
        similarity_boost: 0.75,
        style: 0.35,
        use_speaker_boost: true,
      },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`ElevenLabs TTS failed (${res.status}): ${errBody.slice(0, 200)}`);
  }

  return res.arrayBuffer();
}
