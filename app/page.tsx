"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Stars } from "@/components/Stars";
import { Fireflies } from "@/components/Fireflies";
import { DecorativeBackground } from "@/components/DecorativeBackground";
import { LangToggle } from "@/components/LangToggle";
import { StoryForm } from "@/components/StoryForm";
import { StoryReader } from "@/components/StoryReader";
import { SavedStoriesPanel, type SavedStoryItem } from "@/components/SavedStoriesPanel";
import { DailyTeretCard } from "@/components/DailyTeretCard";
import { PaywallModal } from "@/components/PaywallModal";
import { LoadingState } from "@/components/LoadingState";
import { getT } from "@/lib/constants";
import type { UserProgress } from "@/types";
import { parseStory, parsedToPages } from "@/lib/parseStory";
import { useToast } from "@/components/ToastProvider";
import type { Lang } from "@/types";
import type { StoryPage } from "@/types";

const STORAGE_SAVED = "teret_saved";

function getStoredSaved(): SavedStoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_SAVED);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function HomePage() {
  const [screen, setScreen] = useState<"home" | "loading" | "story">("home");
  const [childName, setChildName] = useState("");
  const [trait, setTrait] = useState("");
  const [traitIdx, setTraitIdx] = useState<number | null>(null);
  const [region, setRegion] = useState("");
  const [storyInspiration, setStoryInspiration] = useState("ethiopian_folklore");
  const [age, setAge] = useState("5-7");
  const [pages, setPages] = useState<StoryPage[]>([]);
  const [illustrationPrompts, setIllustrationPrompts] = useState<string[]>([]);
  const [rawStory, setRawStory] = useState("");
  const [storyRegion, setStoryRegion] = useState("");
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState("");
  const [lang, setLang] = useState<Lang>("en");
  const [usage, setUsage] = useState<{
    subscriptionStatus: "free" | "premium" | null;
    freeStoriesPerDay: number;
    storiesUsedToday: number;
    remainingStoriesToday: number | null;
  } | null>(null);
  const [savedStories, setSavedStories] = useState<SavedStoryItem[]>([]);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isGuest, setIsGuest] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<"free" | "premium" | null>(null);
  const [isDailyTeretView, setIsDailyTeretView] = useState(false);
  const generatingRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const toast = useToast();

  useEffect(() => {
    setSavedStories(getStoredSaved());
  }, []);

  const refreshUsage = useCallback(() => {
    fetch("/api/usage")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          const status = data.subscriptionStatus === "premium" || data.subscriptionStatus === "active" ? "premium" : "free";
          setUsage({
            subscriptionStatus: status,
            freeStoriesPerDay: data.freeStoriesPerDay ?? 3,
            storiesUsedToday: data.storiesUsedToday ?? 0,
            remainingStoriesToday: data.subscriptionStatus === "premium" || data.subscriptionStatus === "active" ? null : (data.remainingStoriesToday ?? 0),
          });
          setSubscriptionStatus(status);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshUsage();
  }, [refreshUsage]);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => (r.ok ? r.json() : { stripeEnabled: false }))
      .then((d) => setStripeEnabled(d.stripeEnabled ?? false))
      .catch(() => setStripeEnabled(false));
  }, []);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setIsGuest(true);
      return;
    }
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setIsGuest(!u);
      if (!u) return;
      Promise.all([
        fetch("/api/profile").then((r) => (r.ok ? r.json() : { progress: null })),
        fetch("/api/stories").then((r) => r.json()),
      ]).then(([profileData, storiesData]) => {
        setUserProgress(profileData.progress ?? null);
        const status = profileData.subscriptionStatus;
        setSubscriptionStatus(status === "premium" || status === "active" ? "premium" : "free");
        const list = ((storiesData.stories ?? []) as {
          id: string;
          childName: string;
          region: string;
          rawStory: string;
          parsedPages?: { am: string; en: string; es: string }[];
          illustrationPrompts?: string[];
          isFavorite?: boolean;
          createdAt: string;
        }[]).map((s) => ({
          id: s.id,
          name: s.childName,
          region: s.region,
          date: s.createdAt ? new Date(s.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
          content: s.rawStory,
          parsedPages: s.parsedPages,
          illustrationPrompts: s.illustrationPrompts,
          isFavorite: s.isFavorite ?? false,
        }));
        setSavedStories(list);
        refreshUsage();
      }).catch(() => {});
    });
  }, [refreshUsage]);

  useEffect(() => {
    if (screen === "loading") {
      let msg = 0;
      intervalRef.current = setInterval(() => {
        msg = (msg + 1) % getT(lang).loading.length;
        setLoadingMsg(msg);
      }, 1800);
      let prog = 0;
      progressRef.current = setInterval(() => {
        prog = Math.min(prog + Math.random() * 2.5, 90);
        setLoadingProgress(prog);
      }, 200);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [screen, lang]);

  const saveStory = useCallback(async () => {
    const entry: SavedStoryItem = {
      id: String(Date.now()),
      name: childName,
      region: storyRegion || "Ethiopian highlands",
      date: new Date().toLocaleDateString(),
      content: rawStory,
      parsedPages: pages.length ? pages : undefined,
      illustrationPrompts: illustrationPrompts.length ? illustrationPrompts : undefined,
    };
    const supabase = createClient();
    if (supabase) {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (u) {
        try {
          const res = await fetch("/api/stories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              childName,
              region: storyRegion || "Ethiopian highlands",
              ageGroup: age,
              trait: trait || undefined,
              rawStory,
              parsedPages: pages.length ? pages : undefined,
              languageDefault: lang,
              illustrationPrompts: illustrationPrompts.length ? illustrationPrompts : undefined,
            }),
          });
          const data = await res.json();
          if (res.ok && data.id) {
            entry.id = data.id;
            entry.date = data.createdAt ?? entry.date;
            const updated = [entry, ...savedStories.filter((s) => s.id !== entry.id)].slice(0, 50);
            setSavedStories(updated);
            toast.showToast(getT(lang).savedConfirm, "success");
            return;
          }
        } catch {
          toast.showToast("Save failed", "error");
          return;
        }
      }
    }
    const updated = [entry, ...savedStories].slice(0, 10);
    setSavedStories(updated);
    try {
      localStorage.setItem(STORAGE_SAVED, JSON.stringify(updated));
    } catch {}
    toast.showToast(getT(lang).savedConfirm, "success");
  }, [childName, storyRegion, rawStory, pages, illustrationPrompts, age, trait, lang, savedStories, toast]);

  const copyStory = useCallback(() => {
    try {
      navigator.clipboard.writeText(rawStory);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.showToast(getT(lang).copiedBtn, "success");
    } catch {
      toast.showToast("Copy failed", "error");
    }
  }, [rawStory, lang, toast]);

  const shareStory = useCallback(() => {
    const shareT = getT(lang);
    const title = shareT.shareTeretTitle;
    const text = shareT.shareTeretText;
    const url = typeof window !== "undefined" ? window.location.origin : "";
    const fullText = url ? `${text}\n${url}` : text;
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({
          title,
          text: fullText,
        })
        .then(() => toast.showToast(shareT.shareSuccess, "success"))
        .catch(() => {});
    } else {
      try {
        navigator.clipboard.writeText(fullText);
        toast.showToast(shareT.shareCopied, "success");
      } catch {
        toast.showToast(shareT.shareCopied, "success");
      }
    }
  }, [lang, toast]);

  const exportStory = useCallback(() => {
    try {
      const blob = new Blob([rawStory], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `teret-teret-${childName.replace(/\s+/g, "-")}-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast.showToast("Exported!", "success");
    } catch {
      toast.showToast("Export failed", "error");
    }
  }, [rawStory, childName, toast]);

  const generateStory = useCallback(async () => {
    if (generatingRef.current) return;
    generatingRef.current = true;
    if (!childName.trim()) {
      generatingRef.current = false;
      return;
    }
    const isPremium = subscriptionStatus === "premium";
    const remaining = usage?.remainingStoriesToday ?? 0;
    if (!isPremium && remaining <= 0 && usage !== null) {
      setShowPaywall(true);
      generatingRef.current = false;
      return;
    }
    setIsGenerating(true);
    setScreen("loading");
    setLoadingMsg(0);
    setLoadingProgress(0);
    setError("");
    setPages([]);

    try {
      const res = await fetch("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childName: childName.trim(),
          ageGroup: age,
          trait: trait || undefined,
          region: region || undefined,
          storyInspiration,
          language: lang,
        }),
      });
      const data = await res.json();

      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
      setLoadingProgress(100);

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setScreen("home");
        toast.showToast(data.error ?? "Try again", "error");
        if (res.status === 402) {
        setShowPaywall(true);
        refreshUsage();
        generatingRef.current = false;
        setIsGenerating(false);
        return;
      }

      setIsGenerating(false);
      refreshUsage();
      setRawStory(data.rawStory ?? "");
      setStoryRegion(data.region ?? "Ethiopian highlands");
      const pageList = data.parsed
        ? parsedToPages(data.parsed)
        : [];
      setPages(pageList);
      setIllustrationPrompts(Array.isArray(data.parsed?.illustrationPrompts) ? data.parsed.illustrationPrompts : []);
      setTimeout(() => setScreen("story"), 500);
    } catch (e) {
      setError("Something went wrong. Please try again.");
      setScreen("home");
      toast.showToast("Network error. Try again.", "error");
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    } finally {
      generatingRef.current = false;
      setIsGenerating(false);
    }
  }, [childName, age, trait, region, storyInspiration, lang, usage, subscriptionStatus, refreshUsage, toast]);

  const handleSubscribe = useCallback(() => {
    setShowPaywall(false);
    if (stripeEnabled) window.location.href = "/api/stripe/checkout";
  }, [stripeEnabled]);

  const openSavedStory = useCallback((story: SavedStoryItem) => {
    setIsDailyTeretView(false);
    setRawStory(story.content);
    setChildName(story.name);
    setStoryRegion(story.region);
    setIllustrationPrompts(story.illustrationPrompts ?? []);
    let pageList: StoryPage[] = [];
    if (story.parsedPages && story.parsedPages.length > 0) {
      pageList = story.parsedPages;
    } else {
      const parsed = parseStory(story.content);
      pageList = parsed ? parsedToPages(parsed) : [];
    }
    setPages(pageList);
    if (pageList.length > 0) {
      setScreen("story");
    } else {
      setError("This saved story could not be displayed as pages.");
      setScreen("home");
    }
    setShowSaved(false);
  }, []);

  const openDailyStory = useCallback((payload: {
    pages: StoryPage[];
    illustrationPrompts: string[];
    childName: string;
    region: string;
    rawStory: string;
    isDailyTeret: true;
  }) => {
    setIsDailyTeretView(true);
    setPages(payload.pages);
    setIllustrationPrompts(payload.illustrationPrompts);
    setChildName(payload.childName);
    setStoryRegion(payload.region);
    setRawStory(payload.rawStory);
    setScreen("story");
  }, []);

  const completeDailyTeret = useCallback(async () => {
    try {
      const res = await fetch("/api/daily-teret/complete", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.progress) {
        setUserProgress(data.progress);
      }
      if (res.ok) {
        fetch("/api/profile")
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => d?.progress && setUserProgress(d.progress))
          .catch(() => {});
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleFavorite = useCallback(async (id: string, isFavorite: boolean) => {
    try {
      const res = await fetch(`/api/stories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite }),
      });
      if (res.ok) {
        setSavedStories((prev) =>
          prev.map((s) => (s.id === id ? { ...s, isFavorite } : s))
        );
      }
    } catch {
      // ignore
    }
  }, []);

  const t = getT(lang);

  return (
    <>
      {showPaywall && (
        <PaywallModal
          onClose={() => setShowPaywall(false)}
          lang={lang}
          onSubscribe={handleSubscribe}
          stripeEnabled={stripeEnabled}
          isGuest={isGuest}
        />
      )}

      {screen === "story" && (
        <StoryReader
          pages={pages}
          illustrationPrompts={illustrationPrompts}
          childName={childName}
          region={storyRegion}
          rawStory={rawStory}
          onNew={() => {
            setScreen("home");
            setIsDailyTeretView(false);
            setPages([]);
            setIllustrationPrompts([]);
            setChildName("");
            setTrait("");
            setTraitIdx(null);
            setRegion("");
            setStoryInspiration("ethiopian_folklore");
            setError("");
          }}
          onAnother={generateStory}
          onSave={saveStory}
          onCopy={copyStory}
          onShare={shareStory}
          onExport={exportStory}
          copied={copied}
          saved={savedStories.some(
            (s) => s.content === rawStory && s.name === childName
          )}
          lang={lang}
          setLang={setLang}
          isDailyTeret={isDailyTeretView}
          onCompleteDailyTeret={completeDailyTeret}
        />
      )}

      <div
        className="min-h-screen relative overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg,#0d0d2b 0%,#1a1a4e 25%,#2d1b69 55%,#5a2d00 100%)",
          fontFamily: "'Nunito',sans-serif",
        }}
      >
        <Stars />
        <DecorativeBackground />

        {screen !== "story" && (
          <div className="fixed top-4 right-4 z-[10] flex items-center gap-2">
            <a
              href="/account"
              className="text-[11px] font-bold text-[#c9b8e8] hover:text-[#FFD700] transition-colors duration-200"
            >
              Account
            </a>
            <LangToggle lang={lang} setLang={setLang} />
          </div>
        )}

        {screen === "home" && (
          <div
            className="fixed top-[18px] left-[18px] z-[2] rounded-[10px] py-1.5 px-2.5 text-[10px] font-bold border transition-all duration-300"
            style={{
              background: subscriptionStatus === "premium" ? "rgba(255,255,255,0.07)" : (usage && usage.remainingStoriesToday <= 0) ? "rgba(255,100,100,0.1)" : "rgba(255,255,255,0.07)",
              borderColor: subscriptionStatus === "premium" ? "rgba(255,215,0,0.2)" : (usage && usage.remainingStoriesToday <= 0) ? "rgba(255,140,140,0.25)" : "rgba(255,215,0,0.2)",
              color: subscriptionStatus === "premium" ? "rgba(255,215,0,0.85)" : (usage && usage.remainingStoriesToday <= 0) ? "rgba(255,180,180,0.9)" : "rgba(255,215,0,0.65)",
            }}
          >
            {subscriptionStatus === "premium"
              ? t.unlimitedStories
              : usage === null
                ? "…"
                : usage.remainingStoriesToday <= 0
                  ? t.limitReachedToday
                  : t.freeLeftToday(usage.remainingStoriesToday)}
          </div>
        )}

        <div
          className="max-w-[600px] mx-auto px-5 pb-24 relative z-[1]"
          style={{ paddingTop: 24 }}
        >
          {screen === "home" && (
            <div style={{ animation: "fadeSlideUp 0.6s ease forwards" }}>
              <div className="text-center pt-10 pb-8">
                <div
                  className="text-[56px] mb-2 inline-block"
                  style={{ animation: "wiggle 2.5s ease-in-out infinite" }}
                  aria-hidden
                >
                  📖
                </div>
                <h1
                  className="font-fredoka text-[#FFD700] leading-tight mb-1"
                  style={{
                    fontSize: "clamp(30px,8vw,46px)",
                    textShadow:
                      "0 4px 0 rgba(0,0,0,0.3),0 0 26px rgba(255,215,0,0.35)",
                  }}
                >
                  {t.appTitle}
                </h1>
                <p className="text-[13px] text-[#c9b8e8] font-semibold mb-2">
                  {t.subtitle}
                </p>
                <span
                  className="inline-block rounded-lg py-1 px-3 text-[11px] font-black text-white tracking-wide border"
                  style={{
                    background: "rgba(255,255,255,0.09)",
                    borderColor: "rgba(255,255,255,0.18)",
                  }}
                >
                  {t.badge}
                </span>
              </div>

              {userProgress != null && (
                <div
                  className="flex justify-center gap-2 mb-3 text-[11px] font-bold"
                  style={{ color: "rgba(255,215,0,0.85)" }}
                >
                  <span>{userProgress.levelName}</span>
                  {userProgress.streakCount > 0 && (
                    <span>· 🔥 {t.streakDays(userProgress.streakCount)}</span>
                  )}
                </div>
              )}

              <DailyTeretCard
                lang={lang}
                progress={userProgress}
                onOpenDailyStory={openDailyStory}
              />

              <SavedStoriesPanel
                lang={lang}
                stories={savedStories}
                open={showSaved}
                onToggle={() => setShowSaved(!showSaved)}
                onOpenStory={openSavedStory}
                onToggleFavorite={isGuest ? undefined : toggleFavorite}
                isGuest={isGuest}
              />
              {isGuest && (
                <p
                  className="mt-2 mb-2 text-[11px] text-[rgba(200,180,255,0.65)] leading-snug px-1"
                  role="status"
                >
                  {savedStories.length > 0 ? t.guestNotice : t.signInToSync}
                </p>
              )}

              <div className="mt-3">
                <StoryForm
                  lang={lang}
                  childName={childName}
                  setChildName={setChildName}
                  age={age}
                  setAge={setAge}
                  trait={trait}
                  traitIdx={traitIdx}
                  setTrait={setTrait}
                  setTraitIdx={setTraitIdx}
                  region={region}
                  setRegion={setRegion}
                  storyInspiration={storyInspiration}
                  setStoryInspiration={setStoryInspiration}
                  onSubmit={generateStory}
                  disabled={!childName.trim() || isGenerating}
                  error={error}
                />
              </div>

              <div
                className="text-center mt-5 text-2xl tracking-[6px] opacity-40"
                aria-hidden
              >
                🦁 🐘 🦒 🦅 🦊
              </div>
            </div>
          )}

          {screen === "loading" && (
            <LoadingState
              lang={lang}
              loadingMsg={loadingMsg}
              loadingProgress={loadingProgress}
            />
          )}
        </div>
      </div>
    </>
  );
}
