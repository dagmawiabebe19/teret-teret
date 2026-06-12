/** Ethiopian script block (Ge'ez / Ethiopic). */
const ETHIOPIC_RE = /[\u1200-\u137F]/;

/** Single ASCII letter sandwiched in Amharic (tag leaks: am, en, es → d, k, e, a, m, s…). */
const ASCII_LEAK_RE =
  /(?:^|[\u1200-\u137F!።፣«»])\s*[a-zA-Z]\s+(?=[\u1200-\u137F])/;

/**
 * Strip stray ASCII letter leaks from Amharic story text.
 * Apply before display and before TTS.
 */
export function sanitizeAmharicStoryText(text: string): string {
  let s = text.trim();
  s = s.replace(/^\[AM\]\s*/i, "");

  let prev = "";
  while (prev !== s) {
    prev = s;
    // Strip any single ASCII letter between Amharic text and a space (d, k, e, a, m, s…)
    s = s.replace(/([\u1200-\u137F!።፣])\s*[a-zA-Z]\s+/g, "$1 ");
    // Leading single letter before first Ethiopic word
    s = s.replace(/^\s*[a-zA-Z]\s+(?=[\u1200-\u137F])/i, "");
  }

  return s.replace(/\s{2,}/g, " ").trim();
}

/** True if text still has tag-leak pattern (check raw Claude output before sanitize). */
export function amharicTextHasAsciiLeak(text: string): boolean {
  const s = text.trim().replace(/^\[AM\]\s*/i, "");
  return ASCII_LEAK_RE.test(s) || /^\s*[a-zA-Z]\s+(?=[\u1200-\u137F])/i.test(s);
}

/** Scan raw story for ASCII leaks inside [AM] blocks. */
export function rawStoryHasAmharicAsciiLeak(rawText: string): boolean {
  for (const line of rawText.split("\n")) {
    const t = line.trim();
    if (!/^\[AM\]/i.test(t)) continue;
    const body = t.replace(/^\[AM\]\s*/i, "");
    if (amharicTextHasAsciiLeak(body)) return true;
  }
  return false;
}

export function lineLooksLikeAmharic(text: string): boolean {
  return ETHIOPIC_RE.test(text);
}
