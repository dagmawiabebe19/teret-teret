export type Lang = "am" | "en" | "es";

export type StoryInspiration =
  | "ethiopian_folklore"
  | "bible_moral"
  | "animal_adventure"
  | "friendship_story";

export interface StoryPage {
  am: string;
  en: string;
  es: string;
}

export interface ParsedStory {
  am: string[];
  en: string[];
  es: string[];
  illustrationPrompts?: string[];
}

export interface StoryMeta {
  id: string;
  childName: string;
  region: string;
  ageGroup: string;
  trait: string;
  createdAt: string;
  languageDefault?: Lang;
}

export interface SavedStory extends StoryMeta {
  rawStory?: string;
  parsedPages?: StoryPage[];
  illustrationPrompts?: string[];
}

export interface UsageInfo {
  generationCount: number;
  limit: number;
  billingPeriodStart: string | null;
  billingPeriodEnd: string | null;
}

export const FREE_STORY_LIMIT = 3;
