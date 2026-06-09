import { parseStory, parsedToPages } from "@/lib/parseStory";
import { getVocabForStory } from "@/lib/vocabulary";
import type { Lang, LibraryStory, StoryPage, VocabWord } from "@/types";

export function libraryStoryToReader(story: LibraryStory, lang: Lang): {
  pages: StoryPage[];
  vocabulary: VocabWord[];
  rawStory: string;
  childName: string;
  region: string;
  illustrationPrompts: string[];
} | null {
  let pageList: StoryPage[] = [];
  if (story.parsedPages && story.parsedPages.length > 0) {
    pageList = story.parsedPages;
  } else {
    const parsed = parseStory(story.rawStory);
    pageList = parsed ? parsedToPages(parsed) : [];
  }
  if (pageList.length === 0) return null;
  return {
    pages: pageList,
    vocabulary: getVocabForStory(pageList, lang),
    rawStory: story.rawStory,
    childName: story.childName,
    region: story.region,
    illustrationPrompts: story.illustrationPrompts ?? [],
  };
}
