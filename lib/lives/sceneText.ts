/**
 * Normalize scene / summary text so DB + UI get real newlines and quotes,
 * not literal backslash-escape sequences from tool-output quirks.
 */
export function unescapeSceneText(input: string): string {
  if (!input) return "";
  let s = input;

  // Double-JSON-encoded: entire value is a quoted JSON string.
  const trimmed = s.trim();
  if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === "string") s = parsed;
    } catch {
      // keep original
    }
  }

  // Literal escape sequences still present (backslash + char as two characters).
  if (
    s.includes("\\n") ||
    s.includes("\\r") ||
    s.includes("\\t") ||
    s.includes('\\"') ||
    s.includes("\\'") ||
    s.includes("\\\\")
  ) {
    s = s
      .replace(/\\r\\n/g, "\n")
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\n")
      .replace(/\\t/g, "\t")
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      .replace(/\\\\/g, "\\");
  }

  return s.trim();
}
