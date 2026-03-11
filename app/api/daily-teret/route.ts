import { NextResponse } from "next/server";
import { getDailyStoryForDate, getTodayDateKey } from "@/lib/dailyTeret";
import { parseStory } from "@/lib/parseStory";
import { buildLocalIllustrationPrompts } from "@/lib/illustrationPrompts";
import type { StoryInspiration } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const today = new Date();
    const dateKey = getTodayDateKey();
    const rawStory = getDailyStoryForDate(today);
    const result = parseStory(rawStory);
    if (!result || result.am.length < 2) {
      return NextResponse.json({ error: "Daily story unavailable" }, { status: 502 });
    }
    const pageContents = result.en.length ? result.en : result.am;
    const illustrationPrompts = buildLocalIllustrationPrompts(
      pageContents,
      "ethiopian_folklore" as StoryInspiration,
      undefined
    );
    result.illustrationPrompts = illustrationPrompts;
    return NextResponse.json({
      rawStory,
      parsed: result,
      region: "Ethiopian highlands",
      dateKey,
    });
  } catch (e) {
    console.error("[daily-teret GET]", e);
    return NextResponse.json({ error: "Daily story unavailable" }, { status: 500 });
  }
}
