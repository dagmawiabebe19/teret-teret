import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { getAnthropicApiKey } from "./anthropic";
import {
  LIVES_ANTHROPIC_TIMEOUT_MS,
  LIVES_MAX_TOKENS,
  LIVES_MODEL,
} from "./constants";
import { applyDeltas } from "./deltas";
import type {
  AppliedSceneResult,
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
summary_update must be a tight compressed memory of what matters going forward: key relationships, unresolved threads, and important facts. Never exceed ~200 words.
narrative should be 2–4 short paragraphs.
proposed_deltas.stats: only include keys that changed this turn (e.g. { "money": -50, "happiness": 5 }).
proposed_deltas.relationships: only existing people by name; only changed dimensions.
age_change is usually 0; use 1 only when meaningful time passes.
`.trim();

const RenderSceneSchema = z.object({
  narrative: z.string().min(1),
  choices: z
    .array(z.object({ label: z.string().min(1) }))
    .min(2)
    .max(4),
  proposed_deltas: z
    .object({
      stats: z.record(z.number()).optional().default({}),
      relationships: z
        .array(
          z.object({
            name: z.string(),
            changes: z.record(z.number()),
          })
        )
        .optional()
        .default([]),
    })
    .optional()
    .default({ stats: {}, relationships: [] }),
  age_change: z.number().optional().default(0),
  summary_update: z.string().min(1),
});

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
          "Full rewritten rolling memory, compressed, <= ~200 words",
      },
    },
    required: ["narrative", "choices", "proposed_deltas", "age_change", "summary_update"],
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

function extractRenderScene(content: Anthropic.ContentBlock[]): RenderSceneInput {
  const block = content.find(
    (b): b is Anthropic.ToolUseBlock =>
      b.type === "tool_use" && b.name === "render_scene"
  );
  if (!block) {
    throw new SceneGenerationError("Model did not call render_scene");
  }
  const parsed = RenderSceneSchema.safeParse(block.input);
  if (!parsed.success) {
    throw new SceneGenerationError("Malformed render_scene tool input");
  }
  return {
    narrative: parsed.data.narrative.trim(),
    choices: parsed.data.choices.map((c) => ({ label: c.label.trim() })),
    proposed_deltas: {
      stats: parsed.data.proposed_deltas.stats ?? {},
      relationships: parsed.data.proposed_deltas.relationships ?? [],
    },
    age_change: parsed.data.age_change ?? 0,
    summary_update: parsed.data.summary_update.trim(),
  };
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
      // Retry only for malformed/missing tool output; still retry once on API blips.
      console.error(`[lives/generateScene] attempt ${attempt + 1} failed:`, err);
    }
  }

  const message =
    lastError instanceof Error ? lastError.message : "Scene generation failed";
  throw new SceneGenerationError(message);
}
