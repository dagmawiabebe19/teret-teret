"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Stars } from "@/components/Stars";
import { DecorativeBackground } from "@/components/DecorativeBackground";
import { AppNav } from "@/components/AppNav";
import { useTranslation } from "@/lib/useTranslation";
import { PRACTICE_SCENARIOS } from "@/lib/practice/scenarios";
import type { Lang } from "@/types";

export default function PracticeHomePage() {
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

  const [authChecking, setAuthChecking] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      router.replace(
        "/account?signin=1&returnTo=" + encodeURIComponent("/practice")
      );
      return;
    }
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace(
          "/account?signin=1&returnTo=" + encodeURIComponent("/practice")
        );
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
      setAuthChecking(false);
    });
  }, [router]);

  if (authChecking) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            "linear-gradient(180deg,#0d0d2b 0%,#1a1a4e 25%,#2d1b69 55%,#5a2d00 100%)",
          fontFamily: "'Nunito',sans-serif",
        }}
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

      <div className="max-w-[640px] mx-auto px-5 pt-16 pb-24 relative z-[1]">
        <h1 className="font-fredoka text-[26px] sm:text-[28px] text-[#FFD700] mb-1">
          Practice English
        </h1>
        <p
          className="text-[15px] text-[#e8e0ff] mb-1"
          style={{ fontFamily: "var(--font-amharic), sans-serif" }}
        >
          እንግሊዝኛ ተለማመድ
        </p>
        <p className="text-[14px] text-[rgba(200,180,255,0.65)] mb-6 leading-relaxed">
          Tap a situation, then speak. Your partner will listen and talk back.
        </p>

        <div className="space-y-3">
          {PRACTICE_SCENARIOS.map((scenario) => (
            <Link
              key={scenario.id}
              href={`/practice/${scenario.id}`}
              className="block w-full rounded-2xl border border-[rgba(255,215,0,0.2)] p-4 sm:p-5 no-underline transition-colors hover:border-[#FFD700] hover:bg-[rgba(255,215,0,0.06)] active:scale-[0.99]"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              <p className="font-fredoka text-[#FFD700] text-[18px] mb-0.5">
                {scenario.titleEn}
              </p>
              <p
                className="text-[15px] text-[#e8e0ff] mb-1"
                style={{ fontFamily: "var(--font-amharic), sans-serif" }}
              >
                {scenario.titleAm}
              </p>
              <p
                className="text-[13px] text-[rgba(200,180,255,0.65)] leading-relaxed"
                style={{ fontFamily: "var(--font-amharic), sans-serif" }}
              >
                {scenario.descriptionAm}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
