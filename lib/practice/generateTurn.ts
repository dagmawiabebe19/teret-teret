import Anthropic from "@anthropic-ai/sdk";
import { getAnthropicApiKey } from "@/lib/lives/anthropic";
import {
  PRACTICE_ANTHROPIC_TIMEOUT_MS,
  PRACTICE_HISTORY_LIMIT,
  PRACTICE_MAX_TOKENS,
  PRACTICE_MODEL,
} from "./constants";
import type { PracticeScenario } from "./scenarios";

export type PracticeMessage = {
  role: "user" | "partner";
  text: string;
};

export type PracticeCorrection = {
  suggestion: string;
  why: string;
};

export type PracticeTurnResult = {
  reply: string;
  corrections: PracticeCorrection[];
};

export class PracticeTurnError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PracticeTurnError";
  }
}

const RESPOND_TOOL: Anthropic.Tool = {
  name: "respond",
  description:
    "Reply in character as the conversation partner, with optional gentle English tips.",
  input_schema: {
    type: "object",
    properties: {
      reply: {
        type: "string",
        description:
          "Your in-character spoken English reply. 1–3 short clear sentences.",
      },
      corrections: {
        type: "array",
        description:
          "0–2 gentle suggestions only when truly helpful. Empty array if her English was fine.",
        maxItems: 2,
        items: {
          type: "object",
          properties: {
            suggestion: {
              type: "string",
              description: 'Kind phrasing like "You can also say…"',
            },
            why: {
              type: "string",
              description:
                "Simple explanation; Amharic is encouraged so she understands.",
            },
          },
          required: ["suggestion", "why"],
          additionalProperties: false,
        },
      },
    },
    required: ["reply", "corrections"],
  },
};

function buildSystemPrompt(scenario: PracticeScenario): string {
  return `
You are a warm, patient English conversation partner for an adult Amharic speaker learning English.

Scenario: ${scenario.titleEn} (${scenario.titleAm})
Your role: ${scenario.partnerBrief}

Rules:
- Stay in character for this situation.
- Speak clear, natural, everyday English at a learner-friendly level.
- Keep replies SHORT: 1–3 sentences. This is a real back-and-forth, not a lecture.
- Be encouraging and kind.
- Offer at most 2 gentle corrections, and ONLY when genuinely helpful. Never nitpick. Empty corrections is fine and often best.
- Corrections should sound soft ("You can also say…"), never scolding.
- For each correction's "why", you may use Amharic so she understands.
- You MUST call the respond tool. Do not write free-form prose outside the tool.
`.trim();
}

function normalizeCorrections(raw: unknown): PracticeCorrection[] {
  if (!Array.isArray(raw)) return [];
  const out: PracticeCorrection[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const suggestion =
      typeof row.suggestion === "string" ? row.suggestion.trim() : "";
    const why = typeof row.why === "string" ? row.why.trim() : "";
    if (!suggestion) continue;
    out.push({ suggestion, why });
    if (out.length >= 2) break;
  }
  return out;
}

function extractRespond(content: Anthropic.ContentBlock[]): PracticeTurnResult {
  const block = content.find(
    (b): b is Anthropic.ToolUseBlock =>
      b.type === "tool_use" && b.name === "respond"
  );
  if (!block || !block.input || typeof block.input !== "object") {
    throw new PracticeTurnError("Model did not call respond");
  }
  const input = block.input as Record<string, unknown>;
  const reply = typeof input.reply === "string" ? input.reply.trim() : "";
  if (!reply) {
    throw new PracticeTurnError("Empty partner reply");
  }
  return {
    reply,
    corrections: normalizeCorrections(input.corrections),
  };
}

export async function generatePracticeTurn(
  scenario: PracticeScenario,
  history: PracticeMessage[]
): Promise<PracticeTurnResult> {
  const apiKey = getAnthropicApiKey();
  if (!apiKey) {
    throw new PracticeTurnError("ANTHROPIC_API_KEY is not set");
  }

  const recent = history.slice(-PRACTICE_HISTORY_LIMIT);
  const anthropic = new Anthropic({
    apiKey,
    timeout: PRACTICE_ANTHROPIC_TIMEOUT_MS,
  });

  try {
    const response = await anthropic.beta.promptCaching.messages.create({
      model: PRACTICE_MODEL,
      max_tokens: PRACTICE_MAX_TOKENS,
      system: [
        {
          type: "text",
          text: buildSystemPrompt(scenario),
          cache_control: { type: "ephemeral" },
        },
      ],
      tools: [RESPOND_TOOL],
      tool_choice: { type: "tool", name: "respond" },
      messages: [
        {
          role: "user",
          content: JSON.stringify(
            {
              scenario: scenario.id,
              conversation: recent.map((m) => ({
                role: m.role,
                text: m.text,
              })),
            },
            null,
            2
          ),
        },
      ],
    });

    return extractRespond(response.content);
  } catch (err) {
    if (err instanceof PracticeTurnError) throw err;
    const message = err instanceof Error ? err.message : String(err);
    console.error("[practice/turn] Anthropic failed:", message);
    throw new PracticeTurnError("Could not generate a reply. Please try again.");
  }
}
