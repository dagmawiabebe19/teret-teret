"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Stars } from "@/components/Stars";
import { DecorativeBackground } from "@/components/DecorativeBackground";
import { StoryLibraryGrid } from "@/components/StoryLibraryGrid";
import { StoryReader } from "@/components/StoryReader";
import { AppNav } from "@/components/AppNav";
import { useTranslation } from "@/lib/useTranslation";
import { libraryStoryToReader } from "@/lib/openLibraryStory";
import type { Lang, LibraryStory } from "@/types";

export default function MyStoriesPage() {
  const router = useRouter();
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    const s = localStorage.getItem("teret_lang");
    return s === "am" || s === "en" || s === "es" ? s : "en";
  });
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("teret_lang", l);
    } catch {
      // ignore
    }
  }, []);
  const { t } = useTranslation(lang);

  const [loading, setLoading] = useState(true);
  const [stories, setStories] = useState<LibraryStory[]>([]);
  const [filter, setFilter] = useState<"all" | "favorites">("all");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const [screen, setScreen] = useState<"list" | "story">("list");
  const [pages, setPages] = useState<LibraryStory["parsedPages"]>([]);
  const [illustrationPrompts, setIllustrationPrompts] = useState<string[]>([]);
  const [rawStory, setRawStory] = useState("");
  const [childName, setChildName] = useState("");
  const [storyRegion, setStoryRegion] = useState("");
  const [storyVocabulary, setStoryVocabulary] = useState<import("@/types").VocabWord[]>([]);
  const [copied, setCopied] = useState(false);

  const loadStories = useCallback(() => {
    fetch("/api/stories")
      .then((r) => r.json())
      .then((d) => {
        setStories((d.stories ?? []) as LibraryStory[]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      router.replace("/account?signin=1");
      return;
    }
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace("/account?signin=1");
        return;
      }
      setEmail(user.email ?? null);
      setDisplayName(
        (user.user_metadata?.full_name as string) ??
          (user.user_metadata?.name as string) ??
          null
      );
      setAvatarUrl(
        (user.user_metadata?.avatar_url as string) ??
          (user.user_metadata?.picture as string) ??
          null
      );
      loadStories();
    });
  }, [router, loadStories]);

  const openStory = useCallback(
    (story: LibraryStory) => {
      const payload = libraryStoryToReader(story, lang);
      if (!payload) return;
      setPages(payload.pages);
      setIllustrationPrompts(payload.illustrationPrompts);
      setRawStory(payload.rawStory);
      setChildName(payload.childName);
      setStoryRegion(payload.region);
      setStoryVocabulary(payload.vocabulary);
      setScreen("story");
    },
    [lang]
  );

  const toggleFavorite = async (id: string, isFavorite: boolean) => {
    const res = await fetch(`/api/stories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite }),
    });
    if (res.ok) {
      setStories((prev) => prev.map((s) => (s.id === id ? { ...s, isFavorite } : s)));
    }
  };

  const deleteStory = async (id: string) => {
    const res = await fetch(`/api/stories/${id}`, { method: "DELETE" });
    if (res.ok) {
      setStories((prev) => prev.filter((s) => s.id !== id));
    }
  };

  if (screen === "story") {
    return (
      <StoryReader
        pages={pages ?? []}
        illustrationPrompts={illustrationPrompts}
        childName={childName}
        region={storyRegion}
        rawStory={rawStory}
        onNew={() => setScreen("list")}
        onAnother={() => setScreen("list")}
        onSave={() => {}}
        onCopy={() => {
          navigator.clipboard.writeText(rawStory);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        copied={copied}
        saved
        lang={lang}
        setLang={setLang}
        vocabulary={storyVocabulary}
      />
    );
  }

  return (
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
      <AppNav
        lang={lang}
        setLang={setLang}
        isSignedIn
        avatarUrl={avatarUrl}
        displayName={displayName}
        email={email}
      />

      <div className="max-w-[640px] mx-auto px-5 pt-16 pb-24 relative z-[1]">
        <Link
          href="/"
          className="inline-block mb-4 text-[12px] font-bold text-[#c9b8e8] hover:text-[#FFD700]"
        >
          {t.homeBtn}
        </Link>
        <h1 className="font-fredoka text-[28px] text-[#FFD700] mb-1">{t.navMyStories}</h1>
        <p className="text-[13px] text-[rgba(200,180,255,0.65)] mb-6">{t.librarySub}</p>

        {loading ? (
          <p className="text-[#c9b8e8] text-center py-12">{t.authLoading}</p>
        ) : (
          <StoryLibraryGrid
            lang={lang}
            stories={stories}
            filter={filter}
            onFilterChange={setFilter}
            onOpen={openStory}
            onToggleFavorite={toggleFavorite}
            onDelete={deleteStory}
          />
        )}
      </div>
    </div>
  );
}
