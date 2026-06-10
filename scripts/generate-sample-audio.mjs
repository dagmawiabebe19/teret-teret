import { writeFileSync, mkdirSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

// Mirrors lib/azureSpeech.ts for standalone script use
const AZURE_DEFAULT_VOICE = "am-ET-MekdesNeural";

// Mirrors lib/elevenlabs.ts prepareBedtimeNarrationText
function prepareBedtimeNarrationText(text) {
  let paced = text.trim();
  paced = paced.replace(/([,፣፥])(\s*)/g, "$1  ");
  paced = paced.replace(/([.!?።])(\s*)/g, "$1  \n\n");
  return paced.trim();
}

function loadLandingSample(constName) {
  const landingSamplePath = join(dirname(fileURLToPath(import.meta.url)), "..", "lib", "landingSample.ts");
  const src = readFileSync(landingSamplePath, "utf8");
  const match = src.match(new RegExp(`export const ${constName}\\s*=\\s*\`([\\s\\S]*?)\`;`));
  if (!match) {
    throw new Error(`Could not parse ${constName} from lib/landingSample.ts`);
  }
  return match[1].trim();
}

// Mirrors lib/azureSpeech.ts buildAmharicSSML
const FULLSTOP_PLACEHOLDER = "\uE000FS\uE001";
const GEEZ_COMMA_PLACEHOLDER = "\uE000GC\uE001";

function escapeXML(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripInvisibleChars(text) {
  return text.replace(/[\u200B-\u200D\uFEFF]/g, "");
}

function buildAmharicSsml(text) {
  const voice = process.env.AZURE_VOICE_AM?.trim() || AZURE_DEFAULT_VOICE;
  let processed = stripInvisibleChars(text.trim());
  processed = escapeXML(processed);
  processed = processed
    .replace(/።/g, FULLSTOP_PLACEHOLDER)
    .replace(/፣/g, GEEZ_COMMA_PLACEHOLDER)
    .replace(new RegExp(FULLSTOP_PLACEHOLDER, "g"), '<break time="600ms"/>')
    .replace(new RegExp(GEEZ_COMMA_PLACEHOLDER, "g"), '<break time="400ms"/>');
  const ssml = `<speak version='1.0' xml:lang='am-ET'><voice name='${voice}'><prosody rate='-25%'>${processed}</prosody></voice></speak>`;
  console.log("[azureSpeech] FULL SSML:", ssml);
  return ssml;
}

function azureTtsUrl() {
  const endpoint = process.env.AZURE_SPEECH_ENDPOINT?.trim();
  if (endpoint) {
    if (endpoint.includes("/cognitiveservices/v1")) return endpoint;
    return `${endpoint.replace(/\/$/, "")}/cognitiveservices/v1`;
  }
  const region = process.env.AZURE_SPEECH_REGION?.trim();
  if (!region) {
    throw new Error("Set AZURE_SPEECH_REGION or AZURE_SPEECH_ENDPOINT");
  }
  return `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
}

async function synthesizeElevenLabs(text) {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Set ELEVENLABS_API_KEY");
  }
  const voiceId = process.env.ELEVENLABS_VOICE_EN?.trim() || "EXAVITQu4vr4xnSDxMaL";
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: prepareBedtimeNarrationText(text),
      model_id: process.env.ELEVENLABS_MODEL_ID?.trim() || "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.75,
        similarity_boost: 0.75,
        style: 0.3,
        use_speaker_boost: true,
      },
    }),
  });
  if (!res.ok) {
    throw new Error(`ElevenLabs failed (${res.status}): ${await res.text()}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function synthesizeAzureAmharic(text) {
  const apiKey = process.env.AZURE_SPEECH_KEY?.trim();
  if (!apiKey) {
    throw new Error("Set AZURE_SPEECH_KEY");
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
    throw new Error(`Azure TTS failed (${res.status}): ${await res.text()}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

async function main() {
  mkdirSync(publicDir, { recursive: true });

  const sampleEn = loadLandingSample("LANDING_SAMPLE_EN");
  const sampleAm = loadLandingSample("LANDING_SAMPLE_AM");

  console.log("Generating English sample (ElevenLabs)...");
  const enBuf = await synthesizeElevenLabs(sampleEn);
  writeFileSync(join(publicDir, "sample-story-en.mp3"), enBuf);
  console.log("Wrote public/sample-story-en.mp3", enBuf.length, "bytes");

  console.log("Generating Amharic sample (Azure Speech)...");
  const amBuf = await synthesizeAzureAmharic(sampleAm);
  writeFileSync(join(publicDir, "sample-story-am.mp3"), amBuf);
  console.log("Wrote public/sample-story-am.mp3", amBuf.length, "bytes");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
