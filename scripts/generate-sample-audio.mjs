import { writeFileSync, mkdirSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

function prepareBedtimeNarrationText(text) {
  let paced = text.trim();
  paced = paced.replace(/([.,])(?=\S)/g, "$1  ");
  paced = paced.replace(/([.!?])\s*/g, "$1\n\n");
  return paced.trim();
}

function loadLandingSampleEn() {
  const landingSamplePath = join(dirname(fileURLToPath(import.meta.url)), "..", "lib", "landingSample.ts");
  const src = readFileSync(landingSamplePath, "utf8");
  const match = src.match(/export const LANDING_SAMPLE_EN\s*=\s*`([\s\S]*?)`;/);
  if (!match) {
    throw new Error("Could not parse LANDING_SAMPLE_EN from lib/landingSample.ts");
  }
  return match[1].trim();
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

async function main() {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) {
    console.error("Set ELEVENLABS_API_KEY to generate sample-story.mp3");
    process.exit(1);
  }
  const voiceId = process.env.ELEVENLABS_VOICE_EN?.trim() || "EXAVITQu4vr4xnSDxMaL";
  const text = prepareBedtimeNarrationText(loadLandingSampleEn());
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: process.env.ELEVENLABS_MODEL_ID?.trim() || "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.7,
        similarity_boost: 0.75,
        style: 0.4,
        use_speaker_boost: true,
      },
    }),
  });
  if (!res.ok) {
    console.error("ElevenLabs failed:", res.status, await res.text());
    process.exit(1);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  mkdirSync(publicDir, { recursive: true });
  writeFileSync(join(publicDir, "sample-story.mp3"), buf);
  console.log("Wrote public/sample-story.mp3", buf.length, "bytes");
}

main();
