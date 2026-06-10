import { createHash } from "crypto";
import type { Lang } from "@/types";

export function ttsCacheKey(text: string, lang: Lang): string {
  return createHash("sha256").update(`${lang}:${text.trim()}`).digest("hex");
}

export function ttsStoragePath(lang: Lang, key: string): string {
  return `${lang}/${key}.mp3`;
}
