"use client";

import Link from "next/link";
import { LangToggle } from "./LangToggle";
import { useTranslation } from "@/lib/useTranslation";
import type { Lang } from "@/types";

interface AppNavProps {
  lang: Lang;
  setLang: (l: Lang) => void;
  isSignedIn: boolean;
  avatarUrl?: string | null;
  displayName?: string | null;
  email?: string | null;
}

function initials(name: string | null | undefined, email: string | null | undefined): string {
  const src = name?.trim() || email?.trim() || "?";
  const parts = src.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

export function AppNav({
  lang,
  setLang,
  isSignedIn,
  avatarUrl,
  displayName,
  email,
}: AppNavProps) {
  const { t } = useTranslation(lang);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[20] border-b border-[rgba(255,215,0,0.08)]"
      style={{
        background: "rgba(13,13,43,0.85)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="max-w-[640px] mx-auto px-4 h-14 flex items-center justify-between gap-2">
        <Link
          href="/"
          aria-label={t.homeBtn}
          className="font-fredoka text-[#FFD700] text-[15px] sm:text-[17px] shrink-0 hover:opacity-90 transition-opacity no-underline"
          style={{ textShadow: "0 0 20px rgba(255,215,0,0.25)" }}
        >
          {t.appTitle}
        </Link>

        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <LangToggle lang={lang} setLang={setLang} />
          {isSignedIn ? (
            <>
              <Link
                href="/my-stories"
                className="hidden sm:inline text-[11px] font-bold text-[#c9b8e8] hover:text-[#FFD700] transition-colors"
              >
                {t.navMyStories}
              </Link>
              <Link
                href="/profile"
                className="w-8 h-8 rounded-full overflow-hidden border border-[rgba(255,215,0,0.35)] flex items-center justify-center bg-[rgba(255,255,255,0.08)] hover:border-[#FFD700] transition-colors"
                aria-label={t.navProfile}
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] font-black text-[#FFD700]">
                    {initials(displayName, email)}
                  </span>
                )}
              </Link>
            </>
          ) : (
            <Link
              href="/account"
              className="min-h-[44px] inline-flex items-center text-[14px] font-medium text-[#c9b8e8] hover:text-[#FFD700] transition-colors"
            >
              {t.navSignIn}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
