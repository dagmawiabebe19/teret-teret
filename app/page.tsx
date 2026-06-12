"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Stars } from "@/components/Stars";
import { Fireflies } from "@/components/Fireflies";
import { QuickStoryForm } from "@/components/QuickStoryForm";
import { LandingHero } from "@/components/LandingHero";
import { SampleAudioSection } from "@/components/landing/SampleAudioSection";
import { TrustSection } from "@/components/landing/TrustSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FinalCTASection } from "@/components/landing/FinalCTASection";
import { PricingSection } from "@/components/PricingSection";
import { SiteFooter } from "@/components/SiteFooter";
import { trackFirstStoryComplete, trackSignupCompletedFromPrompt } from "@/lib/analytics";
import { StoryReader } from "@/components/StoryReader";
import { SavedStoriesPanel, type SavedStoryItem } from "@/components/SavedStoriesPanel";
import { DailyTeretCard } from "@/components/DailyTeretCard";
import { PaywallModal } from "@/components/PaywallModal";
import { LoadingState } from "@/components/LoadingState";
import { getT } from "@/lib/constants";
import { useTranslation } from "@/lib/useTranslation";
import type { UserProgress } from "@/types";
import { parseStory, parsedToPages } from "@/lib/parseStory";
import { getVocabForStory } from "@/lib/vocabulary";
import { getSavedWords, saveWord } from "@/lib/savedWords";
import { useToast } from "@/components/ToastProvider";
import type { Lang } from "@/types";
import type { StoryPage, StoryCategory } from "@/types";
import type { VocabWord } from "@/types";
import {
  REGIONS,
  TRAITS_EN,
  resolveFormCategory,
  type FormStoryCategory,
} from "@/lib/constants";
import { AppNav } from "@/components/AppNav";
import { ChildProfilePicker, applyChildToForm } from "@/components/ChildProfilePicker";
import { RecentlyPlayed } from "@/components/RecentlyPlayed";
import { libraryStoryToReader } from "@/lib/openLibraryStory";
import type { ChildProfile, LibraryStory } from "@/types";
import { getLocalSavedStories } from "@/lib/localSavedStories";
import { hasFullAccess as checkFullAccess } from "@/lib/access";
import { isPremiumStatus } from "@/lib/premium";

export default function HomePage() {
  const router = useRouter();
  const [screen, setScreen] = useState<"home" | "loading" | "story">("home");
  const [childName, setChildName] = useState("");
  const [trait, setTrait] = useState(TRAITS_EN[0] ?? "");
  const [traitIdx, setTraitIdx] = useState<number | null>(0);
  const [region, setRegion] = useState("Simien Mountains");
  const [category, setCategory] = useState<FormStoryCategory>("bedtime");
  const [topic, setTopic] = useState("");
  const [storyGoal, setStoryGoal] = useState("");
  const [age, setAge] = useState("5-7");
  const [pages, setPages] = useState<StoryPage[]>([]);
  const [illustrationPrompts, setIllustrationPrompts] = useState<string[]>([]);
  const [rawStory, setRawStory] = useState("");
  const [storyRegion, setStoryRegion] = useState("");
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState("");
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    const s = localStorage.getItem("teret_lang");
    return s === "am" || s === "en" || s === "es" ? s : "en";
  });
  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    try {
      localStorage.setItem("teret_lang", newLang);
    } catch {
      // ignore
    }
  }, []);
  const { t } = useTranslation(lang);
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
  const [hasFullAccess, setHasFullAccess] = useState(false);
  const [isEthiopiaFree, setIsEthiopiaFree] = useState(false);
  const [isEthiopiaGeo, setIsEthiopiaGeo] = useState(false);
  const [eligibleForSignupPrompt, setEligibleForSignupPrompt] = useState(false);
  const [isDailyTeretView, setIsDailyTeretView] = useState(false);
  const [storyVocabulary, setStoryVocabulary] = useState<VocabWord[]>([]);
  const [savedWords, setSavedWords] = useState<VocabWord[]>([]);
  const [libraryStories, setLibraryStories] = useState<LibraryStory[]>([]);
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const generatingRef = useRef(false);
  const lastStoryCategoryRef = useRef<StoryCategory>("bedtime");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const toast = useToast();

  const scrollToCreate = useCallback(() => {
    document.getElementById("create")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    setSavedStories(getLocalSavedStories());
    setSavedWords(getSavedWords());
  }, []);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("teret:story-reader-active", { detail: screen === "story" })
    );
  }, [screen]);

  const refreshUsage = useCallback(() => {
    fetch("/api/usage")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          const fullAccess = data.hasFullAccess === true;
          const ethiopiaFree = data.isEthiopiaFree === true;
          const status =
            fullAccess && !ethiopiaFree ? "premium" : "free";
          setUsage({
            subscriptionStatus: status,
            freeStoriesPerDay: data.freeStoriesPerDay ?? 1,
            storiesUsedToday: data.storiesUsedToday ?? 0,
            remainingStoriesToday: fullAccess ? null : (data.remainingStoriesToday ?? 0),
          });
          setSubscriptionStatus(status);
          setHasFullAccess(fullAccess);
          setIsEthiopiaFree(ethiopiaFree);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshUsage();
  }, [refreshUsage]);

  useEffect(() => {
    fetch("/api/geo")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.isEthiopia) setIsEthiopiaGeo(true);
      })
      .catch(() => {});
  }, []);

  const showEthiopiaUi = isEthiopiaGeo || isEthiopiaFree;

  useEffect(() => {
    fetch("/api/config")
      .then((r) => (r.ok ? r.json() : { stripeEnabled: false }))
      .then((d) => setStripeEnabled(d.stripeEnabled ?? false))
      .catch(() => setStripeEnabled(false));
  }, []);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible") refreshUsage();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [refreshUsage]);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setIsGuest(true);
      return;
    }
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setIsGuest(!u);
      if (!u) return;
      setUserEmail(u.email ?? null);
      setDisplayName(
        (u.user_metadata?.full_name as string) ??
          (u.user_metadata?.name as string) ??
          null
      );
      setAvatarUrl(
        (u.user_metadata?.avatar_url as string) ??
          (u.user_metadata?.picture as string) ??
          null
      );
      Promise.all([
        fetch("/api/profile").then((r) => (r.ok ? r.json() : { progress: null })),
        fetch("/api/stories").then((r) => r.json()),
        fetch("/api/child-profiles").then((r) => r.json()),
      ]).then(([profileData, storiesData, childData]) => {
        setUserProgress(profileData.progress ?? null);
        const status = profileData.subscriptionStatus;
        const fullAccess =
          profileData.hasFullAccess === true ||
          checkFullAccess({
            subscription_status: status,
            is_ethiopia_free: profileData.isEthiopiaFree,
          });
        const premium = isPremiumStatus(status);
        setSubscriptionStatus(premium ? "premium" : "free");
        setHasFullAccess(fullAccess);
        setIsEthiopiaFree(profileData.isEthiopiaFree === true);
        if (fullAccess) {
          setChildProfiles(childData.profiles ?? []);
          const apiStories = (storiesData.stories ?? []) as LibraryStory[];
          setLibraryStories(apiStories);
          const dbStories = apiStories.map((s) => ({
            id: s.id,
            name: s.childName,
            region: s.region,
            date: s.createdAt ? new Date(s.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
            content: s.rawStory,
            parsedPages: s.parsedPages,
            illustrationPrompts: s.illustrationPrompts,
            isFavorite: s.isFavorite ?? false,
          }));
          setSavedStories(dbStories.slice(0, 50));
        } else {
          setChildProfiles([]);
          setLibraryStories([]);
          setSavedStories(getLocalSavedStories());
        }
        refreshUsage();
        fetch("/api/profile/words")
          .then((r) => (r.ok ? r.json() : { words: [] }))
          .then((d) => setSavedWords(Array.isArray(d?.words) ? d.words : []))
          .catch(() => {});
      }).catch(() => {});
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsGuest(!session?.user);
      if (session?.user) {
        try {
          if (sessionStorage.getItem("signup_from_prompt") === "1") {
            trackSignupCompletedFromPrompt();
            sessionStorage.removeItem("signup_from_prompt");
          }
        } catch {
          // ignore
        }
      }
    });
    return () => subscription.unsubscribe();
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
    if (!hasFullAccess) {
      setShowPaywall(true);
      toast.showToast(t.upgradeToSaveStories, "error");
      return;
    }
    const entry: SavedStoryItem = {
      id: String(Date.now()),
      name: childName,
      region: storyRegion || "Ethiopian highlands",
      date: new Date().toLocaleDateString(),
      content: rawStory,
      parsedPages: pages.length ? pages : undefined,
      illustrationPrompts: illustrationPrompts.length ? illustrationPrompts : undefined,
    };
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
          category,
        }),
      });
      const data = await res.json();
      if (res.status === 402) {
        setShowPaywall(true);
        toast.showToast(t.upgradeToSaveStories, "error");
        return;
      }
      if (res.ok && data.id) {
        entry.id = data.id;
        entry.date = data.createdAt ?? entry.date;
        const updated = [entry, ...savedStories.filter((s) => s.id !== entry.id)].slice(0, 50);
        setSavedStories(updated);
        const libEntry: LibraryStory = {
          id: data.id,
          childName,
          region: storyRegion || "Ethiopian highlands",
          category: lastStoryCategoryRef.current,
          languageDefault: lang,
          rawStory,
          parsedPages: pages.length ? pages : undefined,
          illustrationPrompts: illustrationPrompts.length ? illustrationPrompts : undefined,
          isFavorite: false,
          createdAt: data.createdAt ?? new Date().toISOString(),
          ageGroup: age,
          trait: trait || null,
        };
        setLibraryStories((prev) => [libEntry, ...prev.filter((s) => s.id !== data.id)].slice(0, 50));
        toast.showToast(getT(lang).savedConfirm, "success");
        return;
      }
      toast.showToast(t.errorSaveFailed, "error");
    } catch {
      toast.showToast(t.errorSaveFailed, "error");
    }
  }, [childName, storyRegion, rawStory, pages, illustrationPrompts, age, trait, lang, category, savedStories, hasFullAccess, toast, t]);

  const copyStory = useCallback(() => {
    try {
      navigator.clipboard.writeText(rawStory);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.showToast(getT(lang).copiedBtn, "success");
    } catch {
      toast.showToast(t.copyFailed, "error");
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
      a.download = `teret-stories-${childName.replace(/\s+/g, "-")}-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast.showToast(t.errorExported, "success");
    } catch {
      toast.showToast(t.errorExportFailed, "error");
    }
  }, [rawStory, childName, toast, t]);

  const generateStory = useCallback(async () => {
    if (generatingRef.current) return;
    generatingRef.current = true;
    if (!childName.trim()) {
      generatingRef.current = false;
      return;
    }
    const remaining = usage?.remainingStoriesToday ?? 0;
    if (!hasFullAccess && remaining <= 0 && usage !== null) {
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

    const effectiveRegion =
      region || REGIONS[Math.floor(Math.random() * REGIONS.length)]?.name;
    const effectiveTrait =
      trait || TRAITS_EN[Math.floor(Math.random() * TRAITS_EN.length)];
    const effectiveGoal = storyGoal || "teach_moral";
    const effectiveCategory = resolveFormCategory(category);
    lastStoryCategoryRef.current = effectiveCategory;

    try {
      const res = await fetch("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childName: childName.trim(),
          ageGroup: age,
          trait: effectiveTrait,
          region: effectiveRegion,
          category: effectiveCategory,
          topic: topic.trim() || undefined,
          storyGoal: effectiveGoal,
          language: lang,
        }),
      });
      const data = await res.json();

      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
      setLoadingProgress(100);

      if (!res.ok) {
        const errMsg =
          res.status === 503 ? t.globalCapBreak : (data.error ?? t.errorGeneric);
        setError(errMsg);
        setScreen("home");
        toast.showToast(errMsg, "error");
        if (res.status === 402) {
          setShowPaywall(true);
          refreshUsage();
        }
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
      setStoryVocabulary(Array.isArray(data.parsed?.vocabulary) ? data.parsed.vocabulary : []);
      trackFirstStoryComplete();
      setEligibleForSignupPrompt(true);
      setTimeout(() => setScreen("story"), 500);
    } catch (e) {
      setError(t.errorGeneric);
      setScreen("home");
      toast.showToast(t.errorNetwork, "error");
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    } finally {
      generatingRef.current = false;
      setIsGenerating(false);
    }
  }, [childName, age, trait, region, category, topic, storyGoal, lang, usage, hasFullAccess, refreshUsage, toast, t]);

  const openLibraryStory = useCallback((story: LibraryStory) => {
    const payload = libraryStoryToReader(story, lang);
    if (!payload) {
      setError(t.errorStoryDisplayFailed);
      setScreen("home");
      return;
    }
    setIsDailyTeretView(false);
    setEligibleForSignupPrompt(false);
    setRawStory(payload.rawStory);
    setChildName(payload.childName);
    setStoryRegion(payload.region);
    setIllustrationPrompts(payload.illustrationPrompts);
    setPages(payload.pages);
    setStoryVocabulary(payload.vocabulary);
    setScreen("story");
  }, [lang, t]);

  const handleChildSelect = useCallback(
    (profile: ChildProfile | null) => {
      if (!profile) {
        setSelectedChildId(null);
        return;
      }
      setSelectedChildId(profile.id);
      applyChildToForm(profile, {
        setChildName,
        setAge,
        setTrait,
        setTraitIdx,
      });
    },
    []
  );

  const openSavedStory = useCallback((story: SavedStoryItem) => {
    setIsDailyTeretView(false);
    setEligibleForSignupPrompt(false);
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
    setStoryVocabulary(getVocabForStory(pageList, lang));
    if (pageList.length > 0) {
      setScreen("story");
    } else {
      setError(t.errorStoryDisplayFailed);
      setScreen("home");
    }
    setShowSaved(false);
  }, [lang, t]);

  const openDailyStory = useCallback((payload: {
    pages: StoryPage[];
    illustrationPrompts: string[];
    childName: string;
    region: string;
    rawStory: string;
    isDailyTeret: true;
  }) => {
    setIsDailyTeretView(true);
    setEligibleForSignupPrompt(false);
    setPages(payload.pages);
    setIllustrationPrompts(payload.illustrationPrompts);
    setChildName(payload.childName);
    setStoryRegion(payload.region);
    setRawStory(payload.rawStory);
    setStoryVocabulary(getVocabForStory(payload.pages, lang));
    setScreen("story");
  }, [lang, t]);

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

  const deleteStory = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/stories/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSavedStories((prev) => prev.filter((s) => s.id !== id));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSaveWord = useCallback(
    async (word: VocabWord) => {
      if (isGuest) {
        saveWord(word);
        setSavedWords(getSavedWords());
        toast.showToast(t.wordSaved, "success");
        return;
      }
      try {
        const res = await fetch("/api/profile/words", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(word),
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data.words)) {
          setSavedWords(data.words);
          toast.showToast(t.wordSaved, "success");
        }
      } catch {
        toast.showToast(t.errorCouldNotSaveWord, "error");
      }
    },
    [isGuest, toast, t]
  );

  return (
    <>
      {showPaywall && !hasFullAccess && (
        <PaywallModal
          onClose={() => setShowPaywall(false)}
          lang={lang}
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
            setStoryVocabulary([]);
            setChildName("");
            setTrait("");
            setTraitIdx(null);
            setRegion("");
            setCategory("bedtime");
            setTopic("");
            setStoryGoal("");
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
          subscriptionStatus={subscriptionStatus}
          hasFullAccess={hasFullAccess}
          onShowPaywall={() => {
            if (!hasFullAccess) setShowPaywall(true);
          }}
          vocabulary={storyVocabulary}
          savedWordKeys={new Set(savedWords.map((w) => w.word))}
          onSaveWord={handleSaveWord}
          isGuest={isGuest}
          enableSignupPrompt={eligibleForSignupPrompt}
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

        {screen !== "story" && (
          <AppNav
            lang={lang}
            setLang={setLang}
            isSignedIn={!isGuest}
            avatarUrl={avatarUrl}
            displayName={displayName}
            email={userEmail}
          />
        )}

        <div
          className="max-w-[600px] mx-auto px-5 pb-24 relative z-[1]"
          style={{ paddingTop: screen === "home" ? 72 : 24 }}
        >
          {screen === "home" && (
            <div style={{ animation: "fadeSlideUp 0.6s ease forwards" }}>
              <LandingHero
                lang={lang}
                onCreateClick={scrollToCreate}
                remainingStories={usage?.remainingStoriesToday ?? null}
                storiesUsedToday={usage?.storiesUsedToday ?? 0}
                hasFullAccess={hasFullAccess}
                isEthiopiaUi={showEthiopiaUi}
                onUpgrade={() => {
                  if (!hasFullAccess) setShowPaywall(true);
                }}
              />

              <QuickStoryForm
                lang={lang}
                childName={childName}
                setChildName={setChildName}
                age={age}
                setAge={setAge}
                traitIdx={traitIdx}
                setTrait={setTrait}
                setTraitIdx={setTraitIdx}
                region={region}
                setRegion={setRegion}
                category={category}
                setCategory={setCategory}
                onSubmit={generateStory}
                disabled={!childName.trim() || isGenerating}
                error={error}
              />

              <SampleAudioSection lang={lang} />

              <TrustSection lang={lang} />

              <TestimonialsSection lang={lang} isEthiopiaUi={showEthiopiaUi} />

              {!showEthiopiaUi && (
                <PricingSection
                  lang={lang}
                  isSignedIn={!isGuest}
                  stripeEnabled={stripeEnabled}
                />
              )}

              <FinalCTASection lang={lang} onStartClick={scrollToCreate} />

              <SiteFooter lang={lang} isEthiopiaUi={showEthiopiaUi} />

              {(!isGuest || savedStories.length > 0) && (
                <>
                  {userProgress != null && (
                    <div
                      className="flex justify-center gap-2 mt-10 mb-3 text-[11px] font-bold"
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
                    onDelete={isGuest ? undefined : deleteStory}
                    onToggleFavorite={isGuest ? undefined : toggleFavorite}
                    isGuest={isGuest}
                  />
                  {isGuest && savedStories.length > 0 && (
                    <p
                      className="mt-2 mb-2 text-[11px] text-[rgba(200,180,255,0.65)] leading-snug px-1"
                      role="status"
                    >
                      {t.guestNotice}
                    </p>
                  )}

                  <ChildProfilePicker
                    lang={lang}
                    profiles={childProfiles}
                    selectedId={selectedChildId}
                    onSelect={handleChildSelect}
                    onAddChild={() => router.push("/profile")}
                    isPremium={hasFullAccess}
                    onUpgrade={() => {
                      if (!hasFullAccess) setShowPaywall(true);
                    }}
                  />

                  {hasFullAccess && libraryStories.length > 0 && (
                    <RecentlyPlayed
                      lang={lang}
                      stories={libraryStories}
                      onOpen={openLibraryStory}
                    />
                  )}
                </>
              )}
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
