import { XP_PER_LEVEL, LEVEL_NAMES, type UserProgress } from "@/types";

export const XP_DAILY_TERET = 10;
export const XP_STORY_READ = 5;
export const XP_STORY_SAVE = 2;

export function getLevelFromXp(xp: number): number {
  let level = 0;
  for (let i = XP_PER_LEVEL.length - 1; i >= 0; i--) {
    if (xp >= XP_PER_LEVEL[i]) {
      level = i;
      break;
    }
  }
  return level;
}

export function getXpToNextLevel(xp: number): number {
  const level = getLevelFromXp(xp);
  if (level >= XP_PER_LEVEL.length - 1) return 0;
  const nextThreshold = XP_PER_LEVEL[level + 1];
  return nextThreshold - xp;
}

export function buildUserProgress(
  streakCount: number,
  lastDailyTeretViewedAt: string | null,
  completedDailyTeretDates: string[],
  xp: number
): UserProgress {
  const level = getLevelFromXp(xp);
  return {
    streakCount,
    lastDailyTeretViewedAt,
    completedDailyTeretDates: Array.isArray(completedDailyTeretDates) ? completedDailyTeretDates : [],
    xp,
    level,
    levelName: LEVEL_NAMES[level] ?? LEVEL_NAMES[LEVEL_NAMES.length - 1],
    xpToNextLevel: getXpToNextLevel(xp),
  };
}
