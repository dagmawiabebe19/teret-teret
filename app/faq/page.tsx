"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { FAQSection } from "@/components/landing/FAQSection";
import { AppNav } from "@/components/AppNav";
import { Stars } from "@/components/Stars";
import type { Lang } from "@/types";

export default function FaqPage() {
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

  return (
    <div
      className="min-h-screen relative"
      style={{
        background:
          "linear-gradient(180deg,#0d0d2b 0%,#1a1a4e 25%,#2d1b69 55%,#5a2d00 100%)",
        fontFamily: "'Nunito',sans-serif",
      }}
    >
      <Stars />
      <AppNav lang={lang} setLang={setLang} isSignedIn={false} />
      <div className="max-w-[600px] mx-auto px-5 pt-20 pb-16 relative z-[1]">
        <Link
          href="/"
          className="inline-block mb-6 text-[14px] font-medium text-[var(--color-peach)] hover:text-[#FFD700] no-underline"
        >
          ←
        </Link>
        <FAQSection lang={lang} />
      </div>
    </div>
  );
}
