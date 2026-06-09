const STORY_SESSIONS_KEY = "teret_story_sessions_opened";
const FIRST_STORY_PAGE2_KEY = "teret_first_story_page2_reached";
const READER_SESSION_KEY = "teret_reader_is_first_story";
const DISMISS_KEY = "teret_install_prompt_dismissed_at";
const COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;

/** Display page 2 = zero-based index 1 */
export const FIRST_STORY_PAGE2_INDEX = 1;

export function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari legacy
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function getStorySessionsOpened(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(STORY_SESSIONS_KEY);
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

/** Call when the story reader opens. Returns true if this is the user's first story. */
export function beginStorySession(): boolean {
  try {
    const stored = sessionStorage.getItem(READER_SESSION_KEY);
    if (stored !== null) return stored === "1";

    const isFirst = getStorySessionsOpened() === 0;
    sessionStorage.setItem(READER_SESSION_KEY, isFirst ? "1" : "0");
    localStorage.setItem(STORY_SESSIONS_KEY, String(getStorySessionsOpened() + 1));
    return isFirst;
  } catch {
    return false;
  }
}

export function endStorySession(): void {
  try {
    sessionStorage.removeItem(READER_SESSION_KEY);
  } catch {
    // ignore
  }
}

export function hasReachedFirstStoryPage2(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(FIRST_STORY_PAGE2_KEY) === "1";
  } catch {
    return false;
  }
}

/** Record the magic moment: page 2 of the user's first story. */
export function recordFirstStoryPage2Reached(): void {
  if (hasReachedFirstStoryPage2()) return;
  try {
    localStorage.setItem(FIRST_STORY_PAGE2_KEY, "1");
    window.dispatchEvent(new CustomEvent("teret:first-story-page2"));
  } catch {
    // ignore
  }
}

export function isInstallPromptDismissed(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const dismissedAt = parseInt(raw, 10);
    if (!Number.isFinite(dismissedAt)) return false;
    return Date.now() - dismissedAt < COOLDOWN_MS;
  } catch {
    return false;
  }
}

export function dismissInstallPrompt(): void {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    window.dispatchEvent(new CustomEvent("teret:install-prompt-dismissed"));
  } catch {
    // ignore
  }
}

export type InstallPlatform = "ios" | "android" | "other";

export function detectInstallPlatform(): InstallPlatform {
  if (typeof window === "undefined") return "other";
  const ua = window.navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (isIOS) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}

export function canShowInstallPrompt(): boolean {
  return (
    hasReachedFirstStoryPage2() &&
    !isStandaloneDisplay() &&
    !isInstallPromptDismissed() &&
    detectInstallPlatform() !== "other"
  );
}
