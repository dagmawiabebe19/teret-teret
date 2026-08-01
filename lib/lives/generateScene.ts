import Anthropic from "@anthropic-ai/sdk";
import { getAnthropicApiKey } from "./anthropic";
import {
  LIVES_ANTHROPIC_TIMEOUT_MS,
  LIVES_MAX_TOKENS,
  LIVES_MODEL,
} from "./constants";
import { applyDeltas, ensureEnglishStat } from "./deltas";
import type {
  AppliedSceneResult,
  LifeChoice,
  ProposedDeltas,
  RenderSceneInput,
  SceneGenerationState,
  VocabPair,
} from "./types";
import { unescapeSceneText } from "./sceneText";

const OUTPUT_RULES = `
=== OUTPUT RULES (English-learning life sim) ===
You MUST call the render_scene tool. Do not write free-form prose outside the tool.

NARRATIVE: Write the scene in natural, fluent Amharic (አማርኛ) — 2 short paragraphs, emotionally grounded, ending on a hook. Sound spoken and real, not stilted or translationese.

CHOICES: Provide 2–4 choices. Each choice MUST be a JSON object with:
  - "english": a short, natural, everyday spoken English phrase the character could say or do (required)
  - "amharic": the Amharic meaning/translation of that phrase (required)
All English phrases must be valid English — not right/wrong grammar quizzes. They must mean different things and lead to different life consequences.
Keep English phrases short and useful — things a real person would actually say.
choices MUST be a JSON array of objects. Never use XML, <parameter> tags, or a bare string.

VOCAB (optional): up to 4 { "english", "amharic" } key-word pairs from this scene for a tap-to-learn glossary.

ENGLISH SKILL: Propose a small positive "english" stat gain most turns (typically +1 to +5). Larger gains when the player picks more ambitious or complex English phrasing.

Stay consistent with the state JSON. Never contradict prior beats or the rolling summary.
Keep money and consequences realistic. Propose only modest per-turn changes for other stats.
summary_update must be in English — a tight compressed memory of what matters going forward (<= ~200 words). May be brief or empty on BEGIN.
proposed_deltas may be omitted or empty when nothing changed (common on BEGIN).
age_change is usually 0; use 1 only when meaningful time passes. Omit to mean 0.
`.trim();

const RENDER_SCENE_TOOL: Anthropic.Tool = {
  name: "render_scene",
  description:
    "Render the next English-learning life scene: Amharic narrative, English-phrase choices with Amharic meanings, optional vocab, proposed deltas, age change, and English rolling summary.",
  input_schema: {
    type: "object",
    properties: {
      narrative: {
        type: "string",
        description:
          "The scene in natural fluent Amharic. 2 short paragraphs ending on a hook/cliffhanger.",
      },
      choices: {
        type: "array",
        description:
          "2 to 4 choices. MUST be a JSON array of objects with 'english' and 'amharic' strings. Do not use any other format.",
        minItems: 2,
        maxItems: 4,
        items: {
          type: "object",
          properties: {
            english: {
              type: "string",
              description:
                "Short natural spoken English phrase the character would say or do.",
            },
            amharic: {
              type: "string",
              description: "Amharic translation/meaning of that English phrase.",
            },
          },
          required: ["english", "amharic"],
          additionalProperties: false,
        },
      },
      vocab: {
        type: "array",
        description: "Optional up to 4 key vocabulary pairs from this scene.",
        maxItems: 4,
        items: {
          type: "object",
          properties: {
            english: { type: "string" },
            amharic: { type: "string" },
          },
          required: ["english", "amharic"],
          additionalProperties: false,
        },
      },
      proposed_deltas: {
        type: "object",
        properties: {
          stats: {
            type: "object",
            additionalProperties: { type: "number" },
            description:
              "Only keys that changed, e.g. { money: -50, happiness: 5, english: 3 }",
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
          "Full rewritten rolling memory in English, compressed, <= ~200 words. May be empty on BEGIN.",
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

function extractXmlParam(text: string, name: string): string[] {
  const out: string[] = [];
  const re = new RegExp(
    `<parameter\\s+name=["']${name}["']\\s*>([\\s\\S]*?)(?:</parameter>|(?=<parameter\\b)|$)`,
    "gi"
  );
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const v = match[1].replace(/<\/?[^>]+>/g, "").trim();
    if (v) out.push(v);
  }
  return out;
}

function strField(obj: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

/**
 * Normalize choices to { english, amharic }.
 * Bare strings / { label } become english with empty amharic.
 */
function normalizeChoices(
  choicesRaw: unknown,
  toolInput: Record<string, unknown>
): LifeChoice[] | null {
  const out: LifeChoice[] = [];

  const push = (english: string, amharic = "") => {
    const e = english.trim();
    if (!e) return;
    if (out.some((c) => c.english.toLowerCase() === e.toLowerCase())) return;
    out.push({ english: e, amharic: amharic.trim() });
  };

  if (Array.isArray(choicesRaw)) {
    for (const item of choicesRaw) {
      if (typeof item === "string") {
        const xmlEn = extractXmlParam(item, "english");
        const xmlLabel = extractXmlParam(item, "label");
        if (xmlEn.length > 0) {
          xmlEn.forEach((e) => push(e));
        } else if (xmlLabel.length > 0) {
          xmlLabel.forEach((e) => push(e));
        } else {
          push(item);
        }
        continue;
      }
      if (item && typeof item === "object") {
        const row = item as Record<string, unknown>;
        const english = strField(row, "english", "label", "text");
        const amharic = strField(row, "amharic", "translation", "meaning");
        if (english) push(english, amharic);
      }
    }
  } else if (typeof choicesRaw === "string") {
    const xmlEn = extractXmlParam(choicesRaw, "english");
    const xmlLabel = extractXmlParam(choicesRaw, "label");
    if (xmlEn.length > 0) xmlEn.forEach((e) => push(e));
    else if (xmlLabel.length > 0) xmlLabel.forEach((e) => push(e));
    else {
      for (const line of choicesRaw.split(/\n+/)) {
        const cleaned = line
          .replace(/^[-*•\d.)\s]+/, "")
          .replace(/<\/?[^>]+>/g, "")
          .trim();
        if (cleaned) push(cleaned);
      }
    }
  }

  // Stray top-level english/label leaks
  for (const [key, value] of Object.entries(toolInput)) {
    if (
      key === "english" ||
      key === "label" ||
      /^english[_-]?\d+$/i.test(key) ||
      /^label[_-]?\d+$/i.test(key)
    ) {
      if (typeof value === "string") push(value);
    }
  }

  return out.length >= 2 ? out.slice(0, 4) : null;
}

function normalizeVocab(raw: unknown): VocabPair[] {
  if (!Array.isArray(raw)) return [];
  const out: VocabPair[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const english = strField(row, "english", "word");
    const amharic = strField(row, "amharic", "translation", "meaning");
    if (!english) continue;
    out.push({ english, amharic });
    if (out.length >= 4) break;
  }
  return out;
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

  const choices = normalizeChoices(obj.choices, obj);

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
    narrative: unescapeSceneText(narrative),
    choices,
    vocab: normalizeVocab(obj.vocab),
    proposed_deltas: normalizeProposedDeltas(obj.proposed_deltas),
    age_change: ageRaw ?? 0,
    summary_update: unescapeSceneText(summary),
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
        content: buildUserStateBlock({
          ...state,
          stats: ensureEnglishStat(state.stats),
        }),
      },
    ],
  });

  return extractRenderScene(response.content);
}

export async function generateScene(
  state: SceneGenerationState
): Promise<AppliedSceneResult> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const scene = await callRenderSceneOnce(state);
      const applied = applyDeltas(
        ensureEnglishStat(state.stats),
        state.relationships,
        state.age,
        scene
      );
      return {
        narrative: scene.narrative,
        choices: scene.choices,
        vocab: scene.vocab,
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
