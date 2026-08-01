/** Default / env-overridable model for Practice English turns. */
export const PRACTICE_MODEL =
  process.env.PRACTICE_MODEL?.trim() ||
  process.env.LIVES_MODEL?.trim() ||
  "claude-opus-4-8";

export const PRACTICE_MAX_TOKENS = 1024;
export const PRACTICE_ANTHROPIC_TIMEOUT_MS = 60_000;
export const PRACTICE_HISTORY_LIMIT = 10;
