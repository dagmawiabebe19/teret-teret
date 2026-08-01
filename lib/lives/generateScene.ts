import Anthropic from "@anthropic-ai/sdk";
import { getAnthropicApiKey } from "./anthropic";
import {
  LIVES_ANTHROPIC_TIMEOUT_MS,
  LIVES_MAX_TOKENS,
  LIVES_MODEL,
} from "./constants";
import { applyDeltas } from "./deltas";
import type {
  AppliedSceneResult,
  LifeChoice,
  ProposedDeltas,
  RenderSceneInput,
  SceneGenerationState,
} from "./types";

const OUTPUT_RULES = `
=== OUTPUT RULES ===
You MUST call the render_scene tool. Do not write free-form prose outside the tool.

Stay consistent with the state JSON the user provides. Never contradict prior beats or the rolling summary.
Keep money and consequences realistic for the setting. Propose only modest per-turn changes.
Every scene must end on a hook or cliffhanger that forces a meaningful decision.
Choices (2–4) must be meaningfully different — distinct stakes or directions, not paraphrases.
summary_update must be a tight compressed memory of what matters going forward: key relationships, unresolved threads, and important facts. Never exceed ~200 words. On the opening BEGIN scene it may be brief or empty.
narrative should be 2–4 short paragraphs.
proposed_deltas may be omitted or empty when nothing changed (common on BEGIN).
proposed_deltas.stats: only include keys that changed this turn (e.g. { "money": -50, "happiness": 5 }).
proposed_deltas.relationships: only existing people by name; only changed dimensions.
age_change is usually 0; use 1 only when meaningful time passes. Omit to mean 0.
`.trim();

const RENDER_SCENE_TOOL: Anthropic.Tool = {
  name: "render_scene",
  description:
    "Render the next life-sim scene: narrative, player choices, proposed stat/relationship deltas, age change, and updated rolling summary.",
  input_schema: {
    type: "object",
    properties: {
      narrative: {
        type: "string",
        description: "2–4 short paragraphs ending on a hook/cliffhanger",
      },
      choices: {
        type: "array",
        minItems: 2,
        maxItems: 4,
        items: {
          type: "object",
          properties: {
            label: { type: "string", description: "Player-facing choice text" },
          },
          required: ["label"],
        },
      },
      proposed_deltas: {
        type: "object",
        properties: {
          stats: {
            type: "object",
            additionalProperties: { type: "number" },
            description: "Only keys that changed, e.g. { money: -50, happiness: 5 }",
          },
          relationships: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                changes: {
                  type: "object",
                  additionalProperties: { type: "number" },
                },
              },
              required: ["name", "changes"],
            },
          },
        },
      },
      age_change: {
        type: "number",
        description: "Usually 0; occasionally +1 when time passes",
      },
      summary_update: {
        type: "string",
        description:
          "Full rewritten rolling memory, compressed, <= ~200 words. May be empty on BEGIN.",
      },
    },
    required: ["narrative", "choices"],
  },
};

export class SceneGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SceneGenerationError";
  }
}

function buildSystemPrompt(worldBible: string): string {
  return `${worldBible.trim()}\n\n${OUTPUT_RULES}`;
}

function buildUserStateBlock(state: SceneGenerationState): string {
  return JSON.stringify(
    {
      player_name: state.playerName,
      age: state.age,
      turn_count: state.turnCount,
      stats: state.stats,
      relationships: state.relationships.map((r) => ({
        name: r.name,
        role: r.role,
        dimensions: r.dimensions,
      })),
      summary: state.summary,
      recent_beats: state.recentBeats.map((b) => ({
        turn_number: b.turn_number,
        scene_text: b.scene_text,
        choice_made: b.choice_made,
      })),
      player_action: state.playerAction,
    },
    null,
    2
  );
}

function logMalformedInput(raw: unknown): void {
  let serialized: string;
  try {
    serialized = JSON.stringify(raw, null, 2);
  } catch {
    serialized = String(raw);
  }
  console.error("[lives] malformed render_scene input:", serialized);
}

function asFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function normalizeChoices(raw: unknown): LifeChoice[] | null {
  if (!Array.isArray(raw)) return null;
  const out: LifeChoice[] = [];
  for (const item of raw) {
    if (typeof item === "string") {
      const label = item.trim();
      if (label) out.push({ label });
      continue;
    }
    if (item && typeof item === "object") {
      const labelVal = (item as { label?: unknown; text?: unknown }).label
        ?? (item as { text?: unknown }).text;
      if (typeof labelVal === "string" && labelVal.trim()) {
        out.push({ label: labelVal.trim() });
      }
    }
  }
  if (out.length < 2) return null;
  return out.slice(0, 4);
}

function normalizeProposedDeltas(raw: unknown): ProposedDeltas {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { stats: {}, relationships: [] };
  }
  const obj = raw as Record<string, unknown>;
  const stats: Record<string, number> = {};
  if (obj.stats && typeof obj.stats === "object" && !Array.isArray(obj.stats)) {
    for (const [k, v] of Object.entries(obj.stats as Record<string, unknown>)) {
      const n = asFiniteNumber(v);
      if (n !== null) stats[k] = n;
    }
  }
  const relationships: ProposedDeltas["relationships"] = [];
  if (Array.isArray(obj.relationships)) {
    for (const item of obj.relationships) {
      if (!item || typeof item !== "object") continue;
      const row = item as Record<string, unknown>;
      const name = typeof row.name === "string" ? row.name.trim() : "";
      if (!name) continue;
      const changes: Record<string, number> = {};
      if (row.changes && typeof row.changes === "object" && !Array.isArray(row.changes)) {
        for (const [k, v] of Object.entries(row.changes as Record<string, unknown>)) {
          const n = asFiniteNumber(v);
          if (n !== null) changes[k] = n;
        }
      }
      relationships.push({ name, changes });
    }
  }
  return { stats, relationships };
}

/**
 * Tolerate normal variation from the model. Only narrative + ≥2 choices are required.
 */
export function normalizeRenderSceneInput(raw: unknown): RenderSceneInput {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    logMalformedInput(raw);
    throw new SceneGenerationError("Malformed render_scene tool input");
  }

  const obj = raw as Record<string, unknown>;
  const narrative =
    typeof obj.narrative === "string"
      ? obj.narrative.trim()
      : typeof obj.scene_text === "string"
        ? obj.scene_text.trim()
        : "";

  const choices = normalizeChoices(obj.choices);

  if (!narrative || !choices) {
    logMalformedInput(raw);
    throw new SceneGenerationError("Malformed render_scene tool input");
  }

  const ageRaw = asFiniteNumber(obj.age_change);
  const summary =
    typeof obj.summary_update === "string"
      ? obj.summary_update.trim()
      : typeof obj.summary === "string"
        ? obj.summary.trim()
        : "";

  return {
    narrative,
    choices,
    proposed_deltas: normalizeProposedDeltas(obj.proposed_deltas),
    age_change: ageRaw ?? 0,
    summary_update: summary,
  };
}

function extractRenderScene(content: Anthropic.ContentBlock[]): RenderSceneInput {
  const block = content.find(
    (b): b is Anthropic.ToolUseBlock =>
      b.type === "tool_use" && b.name === "render_scene"
  );
  if (!block) {
    console.error("[lives] malformed render_scene input: (no tool_use block)", {
      contentTypes: content.map((b) => b.type),
    });
    throw new SceneGenerationError("Model did not call render_scene");
  }
  return normalizeRenderSceneInput(block.input);
}

async function callRenderSceneOnce(
  state: SceneGenerationState
): Promise<RenderSceneInput> {
  const apiKey = getAnthropicApiKey();
  if (!apiKey) {
    throw new SceneGenerationError("ANTHROPIC_API_KEY is not set");
  }

  const anthropic = new Anthropic({
    apiKey,
    timeout: LIVES_ANTHROPIC_TIMEOUT_MS,
  });

  const response = await anthropic.beta.promptCaching.messages.create({
    model: LIVES_MODEL,
    max_tokens: LIVES_MAX_TOKENS,
    system: [
      {
        type: "text",
        text: buildSystemPrompt(state.worldBible),
        cache_control: { type: "ephemeral" },
      },
    ],
    tools: [RENDER_SCENE_TOOL],
    tool_choice: { type: "tool", name: "render_scene" },
    messages: [
      {
        role: "user",
        content: buildUserStateBlock(state),
      },
    ],
  });

  return extractRenderScene(response.content);
}

/**
 * Generate a scene via forced tool-use, validate/apply deltas deterministically.
 * Retries once on malformed tool output. Does not write to the database.
 */
export async function generateScene(
  state: SceneGenerationState
): Promise<AppliedSceneResult> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const scene = await callRenderSceneOnce(state);
      const applied = applyDeltas(
        state.stats,
        state.relationships,
        state.age,
        scene
      );
      return {
        narrative: scene.narrative,
        choices: scene.choices,
        summaryUpdate: scene.summary_update,
        stats: applied.stats,
        relationships: applied.relationships,
        age: applied.age,
        deltasApplied: applied.deltasApplied,
      };
    } catch (err) {
      lastError = err;
      console.error(`[lives/generateScene] attempt ${attempt + 1} failed:`, err);
    }
  }

  const message =
    lastError instanceof Error ? lastError.message : "Scene generation failed";
  throw new SceneGenerationError(message);
}
