import { createHash } from "crypto";
import type { Lang } from "@/types";

export function ttsCacheKey(text: string, lang: Lang): string {
  const hash = createHash("sha256").update(`${lang}:${text.trim()}`).digest("hex");
  if (lang === "am") {
    return `azure-am-v2-${hash}`;
  }
  return hash;
}

export function ttsStoragePath(lang: Lang, key: string): string {
  return `${lang}/${key}.mp3`;
}
