/** Read the Anthropic API key from env. Returns null if missing/empty. */
export function getAnthropicApiKey(): string | null {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  return key || null;
}
