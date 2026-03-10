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
import { PaywallModal } from "@/components/PaywallModal";
import { LoadingState } from "@/components/LoadingState";
import { UI, FREE_STORY_LIMIT } from "@/lib/constants";
import { parseStory, parsedToPages } from "@/lib/parseStory";
import { useToast } from "@/components/ToastProvider";
import type { Lang } from "@/types";
import type { StoryPage } from "@/types";

const STORAGE_USED = "teret_used";
const STORAGE_SAVED = "teret_saved";

function getStoredUsed(): number {
  if (typeof window === "undefined") return 0;
  try {
    const n = parseInt(localStorage.getItem(STORAGE_USED) ?? "0", 10);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

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
  const [storiesUsed, setStoriesUsed] = useState(0);
  const [savedStories, setSavedStories] = useState<SavedStoryItem[]>([]);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isGuest, setIsGuest] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const generatingRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const toast = useToast();

  useEffect(() => {
    setStoriesUsed(getStoredUsed());
    setSavedStories(getStoredSaved());
  }, []);

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
      fetch("/api/stories")
        .then((r) => r.json())
        .then((data) => {
          const list = (data.stories ?? []).map(
            (s: {
              id: string;
              childName: string;
              region: string;
              rawStory: string;
              parsedPages?: { am: string; en: string; es: string }[];
              illustrationPrompts?: string[];
              createdAt: string;
            }
            ) => ({
              id: s.id,
              name: s.childName,
              region: s.region,
              date: s.createdAt ? new Date(s.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
              content: s.rawStory,
              parsedPages: s.parsedPages,
              illustrationPrompts: s.illustrationPrompts,
            })
          );
          setSavedStories(list);
        })
        .catch(() => {});
    });
  }, []);

  useEffect(() => {
    if (screen === "loading") {
      let msg = 0;
      intervalRef.current = setInterval(() => {
        msg = (msg + 1) % UI[lang].loading.length;
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

  const saveCount = useCallback((n: number) => {
    setStoriesUsed(n);
    try {
      localStorage.setItem(STORAGE_USED, String(n));
    } catch {}
  }, []);

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
            toast.showToast(UI[lang].savedConfirm, "success");
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
    toast.showToast(UI[lang].savedConfirm, "success");
  }, [childName, storyRegion, rawStory, pages, illustrationPrompts, age, trait, lang, savedStories, toast]);

  const copyStory = useCallback(() => {
    try {
      navigator.clipboard.writeText(rawStory);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.showToast(UI[lang].copiedBtn, "success");
    } catch {
      toast.showToast("Copy failed", "error");
    }
  }, [rawStory, lang, toast]);

  const shareStory = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({
          title: `Teret Teret — ${childName}'s story`,
          text: rawStory.slice(0, 500) + (rawStory.length > 500 ? "…" : ""),
        })
        .then(() => toast.showToast("Shared!", "success"))
        .catch(() => {});
    } else {
      copyStory();
    }
  }, [childName, rawStory, copyStory, toast]);

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
    if (storiesUsed >= FREE_STORY_LIMIT) {
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
        generatingRef.current = false;
        setIsGenerating(false);
        return;
      }

      setIsGenerating(false);
      saveCount(storiesUsed + 1);
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
  }, [childName, age, trait, region, storyInspiration, lang, storiesUsed, saveCount, toast]);

  const handleSubscribe = useCallback(() => {
    setShowPaywall(false);
    if (stripeEnabled) window.location.href = "/api/stripe/checkout";
  }, [stripeEnabled]);

  const openSavedStory = useCallback((story: SavedStoryItem) => {
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

  const t = UI[lang];

  return (
    <>
      {showPaywall && (
        <PaywallModal
          onClose={() => setShowPaywall(false)}
          lang={lang}
          onSubscribe={handleSubscribe}
          stripeEnabled={stripeEnabled}
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
              background: storiesUsed >= FREE_STORY_LIMIT ? "rgba(255,100,100,0.1)" : "rgba(255,255,255,0.07)",
              borderColor: storiesUsed >= FREE_STORY_LIMIT ? "rgba(255,140,140,0.25)" : "rgba(255,215,0,0.2)",
              color: storiesUsed >= FREE_STORY_LIMIT ? "rgba(255,180,180,0.9)" : "rgba(255,215,0,0.65)",
            }}
          >
            {storiesUsed >= FREE_STORY_LIMIT
              ? t.limitReached
              : t.freeLeft(FREE_STORY_LIMIT - storiesUsed)}
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

              <SavedStoriesPanel
                lang={lang}
                stories={savedStories}
                open={showSaved}
                onToggle={() => setShowSaved(!showSaved)}
                onOpenStory={openSavedStory}
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
