/**
 * Illustration prompt builder for Teret-Teret bedtime stories.
 * Generates child-safe, culturally relevant prompts for each page.
 *
 * Designed to be easily pluggable with:
 * - OpenAI DALL·E / Image API
 * - Replicate (SDXL, Flux, etc.)
 * - Stability AI
 * - Other image generation APIs
 */

import type { StoryInspiration } from "@/types";

const STYLE_BASE = [
  "warm children's book illustration",
  "soft magical bedtime lighting",
  "gentle pastel and earth tones",
  "cozy storybook aesthetic",
  "child-safe, whimsical, dreamy",
];

const ETHIOPIAN_CONTEXT = [
  "Ethiopian highlands landscape",
  "traditional Ethiopian homes and villages",
  "Ethiopian clothing and textiles",
  "Ethiopian wildlife (gelada, mountain nyala, hyena, lion)",
  "jebena coffee ceremony elements",
  "eucalyptus forests",
  "ancient stone churches",
  "misty mountains at dusk",
];

const INSPIRATION_CONTEXT: Record<StoryInspiration, string[]> = {
  ethiopian_folklore: ["Ethiopian folklore", "traditional storyteller", "firelit gathering"],
  bible_moral: ["biblical moral tale", "ancient wisdom", "Ethiopian Orthodox aesthetic"],
  animal_adventure: ["friendly animals", "Ethiopian wildlife", "nature adventure"],
  friendship_story: ["warm friendship", "community", "shared adventure"],
};

/**
 * Build the system prompt for the illustration-prompt LLM call.
 */
export function buildIllustrationSystemPrompt(): string {
  return `You are an expert at writing image-generation prompts for children's bedtime storybooks.
Your prompts will be used to create illustrations (via DALL·E, Stable Diffusion, or similar).
Rules:
- Output ONLY valid image prompts, one per line. No numbering, bullets, or extra text.
- Each prompt: 1–2 sentences, 15–40 words.
- Child-safe only: no violence, fear, or scary elements.
- Include: warm lighting, soft colors, bedtime/cosy mood.
- When relevant: Ethiopian setting (highlands, homes, clothing, animals, villages).
- Style: classic children's book illustration, gentle and dreamy.
- Be specific to the page content, not generic.`;
}

/**
 * Build the user prompt for generating illustration prompts for all pages.
 */
export function buildIllustrationUserPrompt(
  pageContents: string[],
  inspiration: StoryInspiration,
  regionName?: string
): string {
  const insp = INSPIRATION_CONTEXT[inspiration] || [];
  const region = regionName ? [`setting: ${regionName}`] : [];
  const hints = [...STYLE_BASE, ...ETHIOPIAN_CONTEXT.slice(0, 3), ...insp, ...region].join(", ");
  const pagesBlock = pageContents
    .map((p, i) => `Page ${i + 1}:\n${p.trim()}`)
    .join("\n\n");

  return `Story inspiration: ${inspiration}. Style hints: ${hints}.

Generate exactly ${pageContents.length} illustration prompts, one per page. Output one prompt per line, in order.

Story pages:
${pagesBlock}`;
}

/**
 * Post-process LLM output into an array of prompts.
 * Handles common formats: numbered lines, bullets, blank lines.
 */
export function parseIllustrationPrompts(llmOutput: string, expectedCount: number): string[] {
  const lines = llmOutput
    .split(/\n/)
    .map((l) => l.replace(/^\d+[\.\)]\s*/, "").replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);
  const prompts = lines.slice(0, expectedCount);
  while (prompts.length < expectedCount) {
    prompts.push(
      "Warm children's book illustration, soft bedtime lighting, gentle colors, Ethiopian storybook style."
    );
  }
  return prompts;
}

/**
 * Generate a single fallback prompt for a page when no LLM is available.
 */
export function fallbackIllustrationPrompt(
  pageText: string,
  inspiration: StoryInspiration
): string {
  const insp = INSPIRATION_CONTEXT[inspiration]?.[0] || "storybook";
  const snippet = pageText.slice(0, 100).trim();
  return `Warm children's book illustration, soft magical bedtime lighting, gentle colors, ${insp} style. Scene: ${snippet || "cozy story moment"}...`;
}

/**
 * Extract a concise scene description from page text (deterministic, no LLM).
 * Uses first sentence or first N chars to keep prompts focused.
 */
function extractSceneSnippet(pageText: string, maxChars = 120): string {
  const trimmed = pageText.trim();
  if (!trimmed) return "cozy story moment";
  const firstSentence = trimmed.match(/^[^.!?]+[.!?]?/)?.[0]?.trim();
  const base = (firstSentence || trimmed).slice(0, maxChars).trim();
  return base + (base.length >= maxChars ? "…" : "") || "cozy story moment";
}

/**
 * Build illustration prompts locally from parsed page text.
 * Deterministic, no API calls. Used by default for speed and cost.
 */
export function buildLocalIllustrationPrompts(
  pageContents: string[],
  inspiration: StoryInspiration,
  regionName?: string
): string[] {
  const styleParts = [
    "Warm children's book illustration",
    "soft magical bedtime lighting",
    "gentle pastel and earth tones",
    "child-safe, whimsical, dreamy",
  ];
  const insp = INSPIRATION_CONTEXT[inspiration]?.[0] ?? "storybook";
  const ethio = ETHIOPIAN_CONTEXT[0]; // "Ethiopian highlands landscape"
  const regionPart = regionName ? `setting in ${regionName}` : ethio;

  return pageContents.map((pageText) => {
    const snippet = extractSceneSnippet(pageText);
    const parts = [...styleParts, `${insp} style`, regionPart, `Scene: ${snippet}`];
    return parts.join(", ") + ".";
  });
}
