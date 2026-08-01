import {
  AGE_CHANGE_MAX,
  AGE_CHANGE_MIN,
  MONEY_DELTA_CAP,
  RELATIONSHIP_DELTA_CAP,
  STAT_DELTA_CAP,
  STAT_MAX,
  STAT_MIN,
} from "./constants";
import type {
  AppliedDeltas,
  LifeRelationship,
  LifeStats,
  ProposedDeltas,
  RenderSceneInput,
} from "./types";

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function asFiniteNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value;
}

function capMagnitude(value: number, cap: number): number {
  return clamp(value, -cap, cap);
}

/**
 * Deterministically validate and apply AI-proposed deltas.
 * The DB/current state is source of truth — unknown keys and people are ignored.
 */
export function applyDeltas(
  currentStats: LifeStats,
  currentRelationships: LifeRelationship[],
  currentAge: number,
  scene: Pick<RenderSceneInput, "proposed_deltas" | "age_change">
): {
  stats: LifeStats;
  relationships: LifeRelationship[];
  age: number;
  deltasApplied: AppliedDeltas;
} {
  const proposed = normalizeProposedDeltas(scene.proposed_deltas);
  const nextStats: LifeStats = { ...currentStats };
  const appliedStats: Record<string, number> = {};

  for (const [key, raw] of Object.entries(proposed.stats)) {
    if (!(key in currentStats)) continue;
    const num = asFiniteNumber(raw);
    if (num === null) continue;

    const capped =
      key === "money"
        ? capMagnitude(num, MONEY_DELTA_CAP)
        : capMagnitude(num, STAT_DELTA_CAP);

    if (capped === 0) continue;

    const base = asFiniteNumber(currentStats[key]) ?? 0;
    let next = base + capped;
    if (key !== "money") {
      next = clamp(next, STAT_MIN, STAT_MAX);
    }
    nextStats[key] = next;
    appliedStats[key] = capped;
  }

  const nextRelationships: LifeRelationship[] = currentRelationships.map((r) => ({
    ...r,
    dimensions: { ...r.dimensions },
  }));
  const appliedRels: Array<{ name: string; changes: Record<string, number> }> = [];

  for (const relChange of proposed.relationships) {
    const name = typeof relChange.name === "string" ? relChange.name.trim() : "";
    if (!name) continue;

    const target = nextRelationships.find(
      (r) => r.name.toLowerCase() === name.toLowerCase()
    );
    if (!target) continue;

    const changes: Record<string, number> = {};
    const rawChanges =
      relChange.changes && typeof relChange.changes === "object"
        ? relChange.changes
        : {};

    for (const [dim, raw] of Object.entries(rawChanges)) {
      if (!(dim in target.dimensions)) continue;
      const num = asFiniteNumber(raw);
      if (num === null) continue;
      const capped = capMagnitude(num, RELATIONSHIP_DELTA_CAP);
      if (capped === 0) continue;
      const base = asFiniteNumber(target.dimensions[dim]) ?? 0;
      target.dimensions[dim] = clamp(base + capped, STAT_MIN, STAT_MAX);
      changes[dim] = capped;
    }

    if (Object.keys(changes).length > 0) {
      appliedRels.push({ name: target.name, changes });
    }
  }

  const rawAge = asFiniteNumber(scene.age_change) ?? 0;
  const ageChange = clamp(Math.round(rawAge), AGE_CHANGE_MIN, AGE_CHANGE_MAX);
  const age = Math.max(0, currentAge + ageChange);

  return {
    stats: nextStats,
    relationships: nextRelationships,
    age,
    deltasApplied: {
      stats: appliedStats,
      relationships: appliedRels,
      age_change: ageChange,
    },
  };
}

function normalizeProposedDeltas(raw: unknown): ProposedDeltas {
  if (!raw || typeof raw !== "object") {
    return { stats: {}, relationships: [] };
  }
  const obj = raw as Record<string, unknown>;
  const stats =
    obj.stats && typeof obj.stats === "object" && !Array.isArray(obj.stats)
      ? (obj.stats as Record<string, number>)
      : {};
  const relationships = Array.isArray(obj.relationships)
    ? (obj.relationships as ProposedDeltas["relationships"])
    : [];
  return { stats, relationships };
}

/** Parse scenario starting_relationships jsonb into LifeRelationship[]. */
export function parseStartingRelationships(raw: unknown): LifeRelationship[] {
  if (!Array.isArray(raw)) return [];
  const out: LifeRelationship[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const name = typeof row.name === "string" ? row.name.trim() : "";
    if (!name) continue;
    const role = typeof row.role === "string" ? row.role : null;
    const dimensions: Record<string, number> = {};
    if (row.dimensions && typeof row.dimensions === "object" && !Array.isArray(row.dimensions)) {
      for (const [k, v] of Object.entries(row.dimensions as Record<string, unknown>)) {
        const n = asFiniteNumber(v);
        if (n !== null) dimensions[k] = clamp(n, STAT_MIN, STAT_MAX);
      }
    }
    out.push({ name, role, dimensions });
  }
  return out;
}

/** Coerce jsonb stats into a plain number map. */
export function parseStats(raw: unknown): LifeStats {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: LifeStats = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const n = asFiniteNumber(v);
    if (n !== null) out[k] = n;
  }
  return out;
}
