/** Ethiopian script block (Ge'ez / Ethiopic). */
const ETHIOPIC_RE = /[\u1200-\u137F]/;

/**
 * Remove stray ASCII prefix before Amharic (e.g. "d አንድ" from "[AM]d" tag leaks).
 */
export function sanitizeAmharicStoryText(text: string): string {
  let s = text.trim();
  s = s.replace(/^\[AM\]\s*/i, "");
  // 1–2 letter ASCII + space before first Ethiopic character
  s = s.replace(/^[a-z]{1,2}\s+(?=[\u1200-\u137F])/i, "");
  return s.trim();
}

export function lineLooksLikeAmharic(text: string): boolean {
  return ETHIOPIC_RE.test(text);
}
