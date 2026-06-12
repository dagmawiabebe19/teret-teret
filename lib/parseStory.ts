import type { ParsedStory, StoryPage } from "@/types";
import { sanitizeAmharicStoryText, lineLooksLikeAmharic } from "@/lib/storyTextSanitize";

const MIN_PAGES = 2;
const MIN_TOTAL_CHARS = 100;

function extractBlocks(raw: string): { am: string; en: string; es: string }[] {
  const lines = raw.split("\n");
  const pages: { am: string; en: string; es: string }[] = [];
  let cur: { am: string; en: string; es: string } = { am: "", en: "", es: "" };
  let activeField: "am" | "en" | "es" | null = null;

  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    const tag = t.toUpperCase();
    if (tag.startsWith("[AM]")) {
      if (cur.am) pages.push({ ...cur });
      cur = {
        am: sanitizeAmharicStoryText(t.replace(/^\[AM\]\s*/i, "").trim()),
        en: "",
        es: "",
      };
      activeField = "am";
    } else if (tag.startsWith("[EN]")) {
      cur.en = t.replace(/^\[EN\]\s*/i, "").trim();
      activeField = "en";
    } else if (tag.startsWith("[ES]")) {
      cur.es = t.replace(/^\[ES\]\s*/i, "").trim();
      activeField = "es";
    } else if (activeField === "am" && lineLooksLikeAmharic(t)) {
      cur.am = sanitizeAmharicStoryText(`${cur.am} ${t}`.trim());
    } else if (activeField === "en" && !lineLooksLikeAmharic(t)) {
      cur.en = `${cur.en} ${t}`.trim();
    } else if (activeField === "es" && !lineLooksLikeAmharic(t)) {
      cur.es = `${cur.es} ${t}`.trim();
    }
  }
  if (cur.am) pages.push({ ...cur });

  return pages.filter((p) => p.am || p.en || p.es);
}

function tryRepairFormat(raw: string): string {
  let repaired = raw;
  repaired = repaired.replace(/\*\*/g, "");
  repaired = repaired.replace(/\n\s*-\s+/g, "\n");
  repaired = repaired.replace(/\n#{1,3}\s+/g, "\n");
  repaired = repaired.replace(/\*\s/g, "\n");
  repaired = repaired.replace(/(\n)\s*\[(AM|EN|ES)\]/gi, "\n[$2]");
  return repaired;
}

function normalizeTagBoundaries(raw: string): string {
  return raw.replace(/([^\n])(\[(?:AM|EN|ES)\])/gi, "$1\n$2");
}

export function parseStory(rawText: string): ParsedStory | null {
  if (!rawText || typeof rawText !== "string") return null;
  const normalized = normalizeTagBoundaries(rawText);
  let pages = extractBlocks(normalized);
  if (pages.length < MIN_PAGES) {
    const repaired = tryRepairFormat(normalized);
    pages = extractBlocks(repaired);
  }

  if (pages.length < MIN_PAGES) return null;

  const totalChars =
    pages.reduce((s, p) => s + (p.am?.length || 0) + (p.en?.length || 0) + (p.es?.length || 0), 0);
  if (totalChars < MIN_TOTAL_CHARS) return null;

  const am: string[] = [];
  const en: string[] = [];
  const es: string[] = [];

  for (const p of pages) {
    am.push(sanitizeAmharicStoryText(p.am || ""));
    en.push(p.en || p.am || "");
    es.push(p.es || p.am || "");
  }

  return { am, en, es };
}

export function parsedToPages(parsed: ParsedStory): StoryPage[] {
  const len = Math.max(parsed.am.length, parsed.en.length, parsed.es.length);
  const pages: StoryPage[] = [];
  for (let i = 0; i < len; i++) {
    pages.push({
      am: sanitizeAmharicStoryText(parsed.am[i] ?? ""),
      en: parsed.en[i] ?? parsed.am[i] ?? "",
      es: parsed.es[i] ?? parsed.am[i] ?? "",
    });
  }
  return pages;
}
