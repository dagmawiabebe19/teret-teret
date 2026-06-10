const DEFAULT_VOICE = "am-ET-MekdesNeural";

const FULLSTOP_PLACEHOLDER = "\uE000FS\uE001";
const GEEZ_COMMA_PLACEHOLDER = "\uE000GC\uE001";

export function isAzureSpeechConfigured(): boolean {
  const key = process.env.AZURE_SPEECH_KEY?.trim();
  const region = process.env.AZURE_SPEECH_REGION?.trim();
  const endpoint = process.env.AZURE_SPEECH_ENDPOINT?.trim();
  return Boolean(key && (region || endpoint));
}

function azureTtsUrl(): string {
  const endpoint = process.env.AZURE_SPEECH_ENDPOINT?.trim();
  if (endpoint) {
    if (endpoint.includes("/cognitiveservices/v1")) return endpoint;
    return `${endpoint.replace(/\/$/, "")}/cognitiveservices/v1`;
  }
  const region = process.env.AZURE_SPEECH_REGION?.trim();
  if (!region) {
    throw new Error("AZURE_SPEECH_REGION or AZURE_SPEECH_ENDPOINT is not set");
  }
  return `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
}

function voiceForAmharic(): string {
  return process.env.AZURE_VOICE_AM?.trim() || DEFAULT_VOICE;
}

function escapeSsmlText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const BREAK_TAG_RE = /<break time="\d+ms"\/>/g;

/** Escape story text while leaving our break tags intact. */
function escapePreservingBreakTags(processed: string): string {
  const tags = processed.match(BREAK_TAG_RE) ?? [];
  const parts = processed.split(BREAK_TAG_RE);
  let out = escapeSsmlText(parts[0] ?? "");
  for (let i = 0; i < tags.length; i++) {
    out += tags[i] + escapeSsmlText(parts[i + 1] ?? "");
  }
  return out;
}

/**
 * Build Amharic SSML with bedtime pacing.
 * Ge'ez ።/፣ are replaced by <break> tags only — not kept in spoken text,
 * because Azure voices may otherwise say "comma" / "period" for those characters.
 */
export function buildAmharicSSML(
  text: string,
  voice: string = DEFAULT_VOICE
): string {
  let processed = text
    .trim()
    .replace(/።/g, FULLSTOP_PLACEHOLDER)
    .replace(/፣/g, GEEZ_COMMA_PLACEHOLDER)
    .replace(new RegExp(FULLSTOP_PLACEHOLDER, "g"), '<break time="600ms"/>')
    .replace(new RegExp(GEEZ_COMMA_PLACEHOLDER, "g"), '<break time="400ms"/>');

  processed = escapePreservingBreakTags(processed);

  const ssml = `<speak version='1.0' xml:lang='am-ET'><voice name='${voice}'><prosody rate='-25%'>${processed}</prosody></voice></speak>`;
  return ssml;
}

/** @deprecated Use buildAmharicSSML — kept for existing imports */
export function buildAmharicSsml(text: string): string {
  return buildAmharicSSML(text, voiceForAmharic());
}

export async function synthesizeAmharicSpeech(text: string): Promise<ArrayBuffer> {
  const apiKey = process.env.AZURE_SPEECH_KEY?.trim();
  if (!apiKey) {
    throw new Error("AZURE_SPEECH_KEY is not set");
  }

  const ssml = buildAmharicSSML(text, voiceForAmharic());
  console.log("[azureSpeech] FULL SSML:", ssml);

  const res = await fetch(azureTtsUrl(), {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": apiKey,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
    },
    body: ssml,
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`Azure TTS failed (${res.status}): ${errBody.slice(0, 200)}`);
  }

  return res.arrayBuffer();
}
