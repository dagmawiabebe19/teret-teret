"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Stars } from "@/components/Stars";
import { DecorativeBackground } from "@/components/DecorativeBackground";
import { AppNav } from "@/components/AppNav";
import { ChildProfileManager } from "@/components/ChildProfileManager";
import {
  ALLOWED_STORY_CATEGORIES,
  getRegionLabel,
} from "@/lib/constants";
import { useTranslation } from "@/lib/useTranslation";
import type { ChildProfile, Lang, ProfileStats, StoryCategory } from "@/types";

function initials(name: string | null, email: string | null): string {
  const src = name?.trim() || email?.trim() || "?";
  const parts = src.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

export default function ProfilePage() {
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
  const [email, setEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);
  const [signOutLoading, setSignOutLoading] = useState(false);

  const refresh = useCallback(() => {
    Promise.all([
      fetch("/api/profile").then((r) => r.json()),
      fetch("/api/child-profiles").then((r) => r.json()),
    ]).then(([profileData, childData]) => {
      if (!profileData.user) {
        router.replace("/account?signin=1");
        return;
      }
      setEmail(profileData.user.email);
      setDisplayName(profileData.user.displayName);
      setAvatarUrl(profileData.user.avatarUrl);
      setStats(profileData.stats);
      setChildProfiles(childData.profiles ?? []);
      setLoading(false);
    });
  }, [router]);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      router.replace("/account");
      return;
    }
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace("/account?signin=1");
        return;
      }
      refresh();
    });
  }, [router, refresh]);

  const handleSignOut = async () => {
    setSignOutLoading(true);
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    router.push("/");
  };

  const categoryLabel = (cat: StoryCategory | null) => {
    if (!cat) return t.noneYet;
    const idx = ALLOWED_STORY_CATEGORIES.indexOf(cat);
    return idx >= 0 ? t.categoryOpts[idx] : cat;
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0d0d2b" }}
      >
        <p className="text-[#c9b8e8]">{t.authLoading}</p>
      </div>
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

      <div className="max-w-[480px] mx-auto px-5 pt-16 pb-24 relative z-[1]">
        <Link
          href="/"
          className="inline-block mb-4 text-[12px] font-bold text-[#c9b8e8] hover:text-[#FFD700]"
        >
          {t.homeBtn}
        </Link>

        <div className="flex flex-col items-center text-center mb-6">
          <div
            className="w-20 h-20 rounded-full overflow-hidden border-2 border-[rgba(255,215,0,0.45)] flex items-center justify-center mb-3"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-black text-[#FFD700]">
                {initials(displayName, email)}
              </span>
            )}
          </div>
          <h1 className="font-fredoka text-[22px] text-[#FFD700]">
            {displayName || email?.split("@")[0] || t.navProfile}
          </h1>
          {email && (
            <p className="text-[13px] text-[rgba(200,180,255,0.65)] mt-1">{email}</p>
          )}
        </div>

        {stats && stats.generationStreak > 0 && (
          <p className="text-center text-[14px] font-bold text-[#FFD700] mb-4">
            {t.generationStreakNights(stats.generationStreak)}
          </p>
        )}

        <div className="grid grid-cols-3 gap-2 mb-6">
          {[
            { label: t.statTotalStories, value: String(stats?.totalStories ?? 0) },
            {
              label: t.statFavoriteLocation,
              value: stats?.favoriteLocation
                ? getRegionLabel(stats.favoriteLocation, lang)
                : t.noneYet,
            },
            {
              label: t.statFavoriteCategory,
              value: categoryLabel(stats?.favoriteCategory ?? null),
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-[14px] border p-3 text-center"
              style={{
                background: "rgba(255,255,255,0.05)",
                borderColor: "rgba(255,215,0,0.12)",
              }}
            >
              <p className="text-[18px] font-black text-[#FFD700] leading-tight truncate">
                {item.value}
              </p>
              <p className="text-[9px] font-bold text-[rgba(200,180,255,0.5)] uppercase mt-1 leading-snug">
                {item.label}
              </p>
            </div>
          ))}
        </div>

        <Link
          href="/my-stories"
          className="block w-full text-center py-3 mb-6 rounded-[14px] border font-bold text-[13px] text-[#FFD700] hover:bg-[rgba(255,215,0,0.08)] transition-colors"
          style={{ borderColor: "rgba(255,215,0,0.3)" }}
        >
          {t.linkToMyStories}
        </Link>

        <ChildProfileManager lang={lang} profiles={childProfiles} onRefresh={refresh} />

        <button
          type="button"
          onClick={handleSignOut}
          disabled={signOutLoading}
          className="w-full mt-6 py-3 rounded-xl border border-[rgba(255,255,255,0.2)] text-sm font-bold text-[#c9b8e8] hover:bg-[rgba(255,255,255,0.05)] disabled:opacity-70"
        >
          {signOutLoading ? t.authLoading : t.signOut}
        </button>
      </div>
    </div>
  );
}
