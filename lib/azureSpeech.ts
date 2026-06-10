const DEFAULT_VOICE = "am-ET-MekdesNeural";

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

function escapeSsml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Insert SSML pauses after Ge'ez punctuation only — never English . or , */
function insertGeezBreaks(escapedText: string): string {
  return escapedText
    .replace(/።(?!\s*<break)/g, '።<break time="600ms"/>')
    .replace(/፣(?!\s*<break)/g, '፣<break time="400ms"/>');
}

export function buildAmharicSsml(text: string): string {
  const voice = voiceForAmharic();
  const safe = insertGeezBreaks(escapeSsml(text.trim()));
  return `<speak version='1.0' xml:lang='am-ET'><voice name='${voice}'><prosody rate='-25%'>${safe}</prosody></voice></speak>`;
}

export async function synthesizeAmharicSpeech(text: string): Promise<ArrayBuffer> {
  const apiKey = process.env.AZURE_SPEECH_KEY?.trim();
  if (!apiKey) {
    throw new Error("AZURE_SPEECH_KEY is not set");
  }

  const ssml = buildAmharicSsml(text);
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
