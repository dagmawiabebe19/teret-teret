/** Default / env-overridable model for Lives scene generation. */
export const LIVES_MODEL =
  process.env.LIVES_MODEL?.trim() || "claude-opus-4-8";

export const LIVES_MAX_TOKENS = 4096;
export const LIVES_ANTHROPIC_TIMEOUT_MS = 90_000;

/** Cap magnitude of a single per-turn delta for 0–100 stats. */
export const STAT_DELTA_CAP = 20;

/** Cap magnitude of a single per-turn money delta (money is unbounded). */
export const MONEY_DELTA_CAP = 5000;

/** Cap magnitude of a single per-turn relationship dimension delta. */
export const RELATIONSHIP_DELTA_CAP = 20;

/** Clamp non-money stats and relationship dimensions to this range after apply. */
export const STAT_MIN = 0;
export const STAT_MAX = 100;

/** Sensible bound on AI-proposed age_change per turn. */
export const AGE_CHANGE_MIN = 0;
export const AGE_CHANGE_MAX = 2;

export const DEFAULT_STARTING_AGE = 18;

/** How many prior beats to include verbatim in the generation context. */
export const RECENT_BEATS_LIMIT = 3;

/**
 * Free-tier Lives decisions per rolling 24h window.
 * Uses the same usage_tracking row / increment_usage RPC as bedtime stories.
 */
export const FREE_LIVES_TURNS_PER_DAY = 10;
