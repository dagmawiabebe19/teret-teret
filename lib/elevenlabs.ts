import type { Lang } from "@/types";

const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech";

/** Warm storyteller voices — override via env for your ElevenLabs account. */
const DEFAULT_VOICES: Record<Lang, string> = {
  en: "EXAVITQu4vr4xnSDxMaL", // Sarah — clear, warm
  es: "EXAVITQu4vr4xnSDxMaL", // multilingual v2
  am: "EXAVITQu4vr4xnSDxMaL", // multilingual v2 for Amharic
};

const DEFAULT_MODEL_ID = "eleven_multilingual_v2";

/** Bedtime pacing: extra pauses after punctuation + breathing room between sentences. */
export function prepareBedtimeNarrationText(text: string): string {
  let paced = text.trim();
  paced = paced.replace(/([.,፣፥])(?=\S)/g, "$1  ");
  paced = paced.replace(/([.!?።])\s*/g, "$1\n\n");
  return paced.trim();
}

export function isElevenLabsConfigured(): boolean {
  return Boolean(process.env.ELEVENLABS_API_KEY?.trim());
}

function modelId(): string {
  return process.env.ELEVENLABS_MODEL_ID?.trim() || DEFAULT_MODEL_ID;
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
  const narrationText = prepareBedtimeNarrationText(text);
  const res = await fetch(`${ELEVENLABS_API_URL}/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: narrationText,
      model_id: modelId(),
      voice_settings: {
        stability: 0.7,
        similarity_boost: 0.75,
        style: 0.4,
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
