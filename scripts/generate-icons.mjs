import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1a0533"/>
      <stop offset="100%" stop-color="#2d1b69"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#bg)"/>
  <circle cx="360" cy="120" r="6" fill="#FFD700" opacity="0.9"/>
  <circle cx="400" cy="180" r="4" fill="#FFD700" opacity="0.7"/>
  <circle cx="120" cy="100" r="5" fill="#FFD700" opacity="0.8"/>
  <circle cx="90" cy="160" r="3" fill="#FFD700" opacity="0.6"/>
  <path d="M256 110c-72 0-130 58-130 130 0 72 58 130 130 130 20 0 39-4 56-13-28-18-46-49-46-85 0-55 45-100 100-100 8 0 16 1 23 3-22-42-66-65-133-65z" fill="#FFD700"/>
  <text x="256" y="400" text-anchor="middle" font-family="Georgia, serif" font-size="52" font-weight="bold" fill="#FFD700">ተረት</text>
</svg>`;

mkdirSync(publicDir, { recursive: true });
const buffer = Buffer.from(svg);

for (const size of [192, 512, 180]) {
  const name = size === 180 ? "apple-touch-icon.png" : `icon-${size}.png`;
  await sharp(buffer).resize(size, size).png().toFile(join(publicDir, name));
}

console.log("Generated PWA icons in public/");
