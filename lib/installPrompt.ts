const STORY_COUNT_KEY = "teret_stories_generated_total";
const DISMISS_KEY = "teret_install_prompt_dismissed_at";
const COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;

export function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari legacy
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function getStoriesGenerated(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(STORY_COUNT_KEY);
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function recordStoryGenerated(): number {
  const next = getStoriesGenerated() + 1;
  try {
    localStorage.setItem(STORY_COUNT_KEY, String(next));
    window.dispatchEvent(new CustomEvent("teret:story-generated", { detail: next }));
  } catch {
    // ignore
  }
  return next;
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

export function canShowInstallPrompt(storyCount: number): boolean {
  return (
    storyCount >= 2 &&
    !isStandaloneDisplay() &&
    !isInstallPromptDismissed() &&
    detectInstallPlatform() !== "other"
  );
}
