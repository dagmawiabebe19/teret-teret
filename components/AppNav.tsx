"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname() || "/";
  const onLives = pathname.startsWith("/lives");
  const onStories = !onLives;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[20] border-b border-[rgba(255,215,0,0.08)]"
      style={{
        background: "rgba(13,13,43,0.85)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="max-w-[640px] mx-auto px-4 h-14 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href="/"
            aria-label={t.homeBtn}
            className="font-fredoka text-[#FFD700] text-[15px] sm:text-[17px] shrink-0 hover:opacity-90 transition-opacity no-underline"
            style={{ textShadow: "0 0 20px rgba(255,215,0,0.25)" }}
          >
            {t.appTitle}
          </Link>
          <nav
            className="flex items-center gap-0.5 sm:gap-1 min-w-0"
            aria-label="Sections"
          >
            <Link
              href="/"
              className={`px-1.5 sm:px-2 py-1 rounded-full text-[10px] sm:text-[11px] font-bold no-underline whitespace-nowrap transition-colors ${
                onStories
                  ? "text-[#1a0533] bg-[#FFD700]"
                  : "text-[#c9b8e8] hover:text-[#FFD700]"
              }`}
            >
              {t.navBedtimeStories}
            </Link>
            <Link
              href="/lives"
              className={`px-1.5 sm:px-2 py-1 rounded-full text-[10px] sm:text-[11px] font-bold no-underline whitespace-nowrap transition-colors ${
                onLives
                  ? "text-[#1a0533] bg-[#FFD700]"
                  : "text-[#c9b8e8] hover:text-[#FFD700]"
              }`}
            >
              {t.navLives}
            </Link>
          </nav>
        </div>

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
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                href="/account?mode=signin"
                className="hidden sm:inline-flex min-h-[44px] items-center text-[13px] sm:text-[14px] font-medium text-[#c9b8e8] hover:text-[#FFD700] transition-colors no-underline"
              >
                {t.navSignIn}
              </Link>
              <Link
                href="/account?mode=signup"
                className="min-h-[36px] sm:min-h-[38px] inline-flex items-center px-3.5 sm:px-4 rounded-full text-[12px] sm:text-[13px] font-bold text-[#1a0533] no-underline transition-transform hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #FFB088, #FFD700)",
                  boxShadow: "0 2px 12px rgba(255,140,0,0.25)",
                }}
              >
                {t.navSignUp}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
