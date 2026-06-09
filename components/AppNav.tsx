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
    <div className="fixed top-4 right-4 z-[10] flex items-center gap-2">
      {isSignedIn && (
        <>
          <Link
            href="/my-stories"
            className="text-[11px] font-bold text-[#c9b8e8] hover:text-[#FFD700] transition-colors duration-200"
          >
            {t.navMyStories}
          </Link>
          <Link
            href="/profile"
            className="w-8 h-8 rounded-full overflow-hidden border border-[rgba(255,215,0,0.35)] flex items-center justify-center bg-[rgba(255,255,255,0.08)] hover:border-[#FFD700] transition-colors"
            aria-label={t.navProfile}
            title={t.navProfile}
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
      )}
      {!isSignedIn && (
        <Link
          href="/account"
          className="text-[11px] font-bold text-[#c9b8e8] hover:text-[#FFD700] transition-colors duration-200"
        >
          {t.navAccount}
        </Link>
      )}
      <LangToggle lang={lang} setLang={setLang} />
    </div>
  );
}
