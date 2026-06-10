import type { Lang, StoryCategory } from "@/types";
import { translations, getT, getTranslations, getRegionLabel, type UITranslations } from "./translations";

export const FREE_STORY_LIMIT = 1;

export { translations as UI, getT, getTranslations, getRegionLabel, type UITranslations };

export const AGES = [
  {
    value: "2-4",
    detail:
      "very short (under 200 words), extremely simple words, one tiny gentle challenge, very soothing",
  },
  {
    value: "5-7",
    detail:
      "short (250-350 words), simple words, one clear challenge with a happy resolution",
  },
  {
    value: "8-12",
    detail:
      "medium (400-550 words), richer vocabulary, more interesting challenge, deeper moral lesson",
  },
] as const;

export const TRAITS_EN = translations.en.traits;

export const REGIONS = [
  {
    name: "Addis Ababa",
    detail:
      "the busy, colorful streets and eucalyptus forests of Ethiopia's capital city",
  },
  {
    name: "Lalibela",
    detail: "the ancient rock-hewn churches and misty mountains of Lalibela",
  },
  {
    name: "Axum",
    detail:
      "the ancient kingdom of Axum with its towering obelisks and stone ruins",
  },
  {
    name: "Gondar",
    detail: "the royal castles and highland meadows of Gondar",
  },
  {
    name: "Lake Tana",
    detail:
      "the shores of Lake Tana where hippos rest and monasteries sit on islands",
  },
  {
    name: "Simien Mountains",
    detail:
      "the dramatic cliffs and misty peaks of the Simien Mountains",
  },
  {
    name: "Bale Mountains",
    detail:
      "the cloud forests and alpine meadows of the Bale Mountains",
  },
  {
    name: "Harar",
    detail:
      "the ancient walled city of Harar with its colorful markets and narrow alleys",
  },
  {
    name: "Omo Valley",
    detail:
      "the lush Omo Valley where the great river meets ancient communities",
  },
  {
    name: "Kaffa forests",
    detail:
      "the dense green forests of Kaffa — the birthplace of coffee itself",
  },
  {
    name: "Afar lowlands",
    detail:
      "the volcanic Afar lowlands where hot springs bubble and salt caravans pass",
  },
  {
    name: "Rift Valley lakes",
    detail:
      "the Rift Valley lakes where thousands of flamingos paint the water pink",
  },
  {
    name: "Tigray highlands",
    detail:
      "the rugged red rock highlands of Tigray dotted with cliff-top churches",
  },
  {
    name: "Gambella wetlands",
    detail:
      "the lush wetlands of Gambella where the Nile begins its long journey",
  },
  {
    name: "Dire Dawa",
    detail: "the warm, bustling crossroads city of Dire Dawa",
  },
] as const;

export const ANIMALS = [
  "🦁",
  "🐊",
  "🦅",
  "🐆",
  "🐘",
  "🦒",
  "🦓",
  "🦔",
  "🐒",
  "🦩",
];

export const ALLOWED_AGES = ["2-4", "5-7", "8-12"] as const;
export const ALLOWED_REGIONS = REGIONS.map((r) => r.name);
export const ALLOWED_STORY_INSPIRATIONS = [
  "ethiopian_folklore",
  "bible_moral",
  "animal_adventure",
  "friendship_story",
] as const;

/** Learning-through-storytelling categories. Order matches categoryOpts in UI. */
export const ALLOWED_STORY_CATEGORIES = [
  "bedtime",
  "math",
  "science",
  "history",
  "faith",
  "language_learning",
  "culture_values",
] as const;

/** Story goals (how the story teaches). */
export const ALLOWED_STORY_GOALS = [
  "teach_concept",
  "teach_moral",
  "teach_vocabulary",
  "teach_history",
  "teach_faith_value",
] as const;

/** Emoji per category for UI. */
export const CATEGORY_EMOJI: Record<(typeof ALLOWED_STORY_CATEGORIES)[number], string> = {
  bedtime: "🌙",
  math: "🔢",
  science: "🔬",
  history: "📜",
  faith: "🕊️",
  language_learning: "🌍",
  culture_values: "💫",
};

/** Map category to legacy inspiration for illustration/daily-teret when needed. */
export const CATEGORY_TO_INSPIRATION: Record<(typeof ALLOWED_STORY_CATEGORIES)[number], (typeof ALLOWED_STORY_INSPIRATIONS)[number]> = {
  bedtime: "ethiopian_folklore",
  math: "animal_adventure",
  science: "animal_adventure",
  history: "ethiopian_folklore",
  faith: "bible_moral",
  language_learning: "friendship_story",
  culture_values: "friendship_story",
};

export const TRAIT_INDICES = TRAITS_EN.map((_, i) => i);

/** Kid-friendly story form — visible pill options (homepage). */
export const FORM_AGE_EMOJIS = ["🐣", "🦊", "🦁"] as const;

export const FORM_REGIONS = [
  { apiName: "Simien Mountains", emoji: "🏔️" },
  { apiName: "Lalibela", emoji: "⛪" },
  { apiName: "Axum", emoji: "🏛️" },
  { apiName: "Lake Tana", emoji: "🌊" },
  { apiName: "Addis Ababa", emoji: "🏙️" },
  { apiName: "Afar lowlands", emoji: "🌋" },
  { apiName: "Bale Mountains", emoji: "🦓" },
  { apiName: "Harar", emoji: "🐪" },
] as const;

export const FORM_TRAITS = [
  { traitIndex: 0, emoji: "⚡" },
  { traitIndex: 3, emoji: "🤝" },
  { traitIndex: 2, emoji: "🦋" },
  { traitIndex: 11, emoji: "🎨" },
  { traitIndex: 5, emoji: "😄" },
  { traitIndex: 15, emoji: "🌟" },
] as const;

export type FormStoryCategory =
  | (typeof ALLOWED_STORY_CATEGORIES)[number]
  | "surprise";

export const FORM_STORY_CATEGORIES: {
  id: FormStoryCategory;
  emoji: string;
  apiCategory?: (typeof ALLOWED_STORY_CATEGORIES)[number];
}[] = [
  { id: "bedtime", emoji: "🌙", apiCategory: "bedtime" },
  { id: "history", emoji: "📚", apiCategory: "history" },
  { id: "science", emoji: "🔬", apiCategory: "science" },
  { id: "faith", emoji: "🙏", apiCategory: "faith" },
  { id: "culture_values", emoji: "🌍", apiCategory: "culture_values" },
  { id: "surprise", emoji: "🎲" },
];

export const SURPRISE_CATEGORY_POOL = [
  "bedtime",
  "history",
  "science",
  "faith",
  "culture_values",
] as const satisfies readonly (typeof ALLOWED_STORY_CATEGORIES)[number][];

export function resolveFormCategory(category: FormStoryCategory): StoryCategory {
  if (category === "surprise") {
    return SURPRISE_CATEGORY_POOL[
      Math.floor(Math.random() * SURPRISE_CATEGORY_POOL.length)
    ]!;
  }
  return category;
}
