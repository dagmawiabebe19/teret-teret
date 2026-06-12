const DEFAULT_VOICE = "am-ET-MekdesNeural";

const FULLSTOP_PLACEHOLDER = "\uE000FS\uE001";
const GEEZ_COMMA_PLACEHOLDER = "\uE000GC\uE001";

/**
 * Expected clean SSML shape (Vercel log `[azureSpeech] FULL SSML:`):
 *
 * <speak version='1.0' xml:lang='am-ET'><voice name='am-ET-MekdesNeural'><prosody rate='-25%'>
 * ተረት ተረት<break time="600ms"/> በአዲስ አበባ ላይባል ያሉት አረንጓዴ ተራሮች ላይ ልያ የተባለች ትንሽ ልጅ ነበረች<break time="600ms"/>
 * </prosody></voice></speak>
 *
 * Must NOT contain: &#63;, &quest;, ፣, ።, literal "comma", or "question mark" artifacts.
 */

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

/** Only escape XML structural characters — never ? ! . or other punctuation. */
function escapeXML(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripInvisibleChars(text: string): string {
  return text.replace(/[\u200B-\u200D\uFEFF]/g, "");
}

/** Prepare story text for Azure SSML — newlines and some punctuation break synthesis. */
function sanitizeForAmharicSsml(text: string): string {
  let s = stripInvisibleChars(text.trim());
  s = s.replace(/\r\n/g, "\n").replace(/\s+/g, " ");
  s = s.replace(/[,.\?!;:]/g, "");
  s = s.replace(/[«»""]/g, "");
  s = s.replace(/^[a-z]{1,2}\s+(?=[\u1200-\u137F])/i, "");
  return s.trim();
}

type AmharicSSMLPipeline = {
  strippedText: string;
  escapedText: string;
  textWithBreaks: string;
  ssml: string;
};

/** Same pipeline as buildAmharicSSML — exposes intermediates for debug logging only. */
function buildAmharicSSMLPipeline(
  text: string,
  voice: string = DEFAULT_VOICE
): AmharicSSMLPipeline {
  const strippedText = sanitizeForAmharicSsml(text);
  const escapedText = escapeXML(strippedText);
  const textWithBreaks = escapedText
    .replace(/።/g, FULLSTOP_PLACEHOLDER)
    .replace(/፣/g, GEEZ_COMMA_PLACEHOLDER)
    .replace(new RegExp(FULLSTOP_PLACEHOLDER, "g"), '<break time="600ms"/>')
    .replace(new RegExp(GEEZ_COMMA_PLACEHOLDER, "g"), '<break time="400ms"/>');

  const ssml = `<speak version='1.0' xml:lang='am-ET'><voice name='${voice}'><prosody rate='-25%'>${textWithBreaks}</prosody></voice></speak>`;
  return { strippedText, escapedText, textWithBreaks, ssml };
}

/**
 * Build Amharic SSML with bedtime pacing.
 * 1. Strip zero-width / BOM
 * 2. Escape XML special chars in story text
 * 3. Replace Ge'ez ።/፣ with <break> tags (not spoken — avoids "comma"/"period")
 */
export function buildAmharicSSML(
  text: string,
  voice: string = DEFAULT_VOICE
): string {
  return buildAmharicSSMLPipeline(text, voice).ssml;
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

  const voice = voiceForAmharic();
  const endpoint = azureTtsUrl();
  const prepared = sanitizeForAmharicSsml(text);
  if (!prepared) {
    throw new Error("Azure TTS: empty text after sanitization");
  }
  const { strippedText, escapedText, textWithBreaks, ssml } = buildAmharicSSMLPipeline(
    prepared,
    voice
  );

  console.log("[AzureTTS] ===== START =====");
  console.log("[AzureTTS] Raw input text length:", text.length);
  console.log("[AzureTTS] Raw input text (first 200 chars):", text.slice(0, 200));
  console.log(
    "[AzureTTS] Raw input text (hex of first 50 bytes):",
    Buffer.from(text.slice(0, 50)).toString("hex")
  );
  console.log("[AzureTTS] After zero-width strip:", strippedText.slice(0, 200));
  console.log("[AzureTTS] After XML escape:", escapedText.slice(0, 200));
  console.log("[AzureTTS] After break tag insertion:", textWithBreaks.slice(0, 300));
  console.log("[AzureTTS] FINAL SSML being sent to Azure:");
  console.log(ssml);
  console.log("[AzureTTS] Voice:", voice);
  console.log("[AzureTTS] Endpoint:", endpoint);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": apiKey,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
    },
    body: ssml,
  });

  console.log("[AzureTTS] Azure response status:", response.status);
  console.log(
    "[AzureTTS] Azure response headers:",
    JSON.stringify(Object.fromEntries(response.headers.entries()))
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("[AzureTTS] Azure error body:", errorBody);
    console.log("[AzureTTS] ===== END =====");
    throw new Error(`Azure TTS failed (${response.status}): ${errorBody.slice(0, 200)}`);
  }

  const audioBuffer = await response.arrayBuffer();
  console.log("[AzureTTS] Audio bytes received:", audioBuffer.byteLength);
  console.log("[AzureTTS] ===== END =====");

  return audioBuffer;
}
