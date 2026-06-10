"use client";

import { useTranslation } from "@/lib/useTranslation";
import { trackGenerateStoryCta } from "@/lib/analytics";
import type { Lang } from "@/types";

interface FinalCTASectionProps {
  lang: Lang;
  onStartClick: () => void;
}

export function FinalCTASection({ lang, onStartClick }: FinalCTASectionProps) {
  const { t } = useTranslation(lang);

  return (
    <section className="mb-10 text-center py-8">
      <div className="text-[56px] mb-4" aria-hidden>
        🌙✨
      </div>
      <p className="font-fredoka text-[#FFD700] text-[22px] sm:text-[26px] mb-6">
        {t.finalCtaLine}
      </p>
      <button
        type="button"
        onClick={() => {
          trackGenerateStoryCta("final_cta");
          onStartClick();
        }}
        className="w-full min-h-[72px] py-4 px-6 rounded-[22px] text-[18px] font-medium text-[#1a0533] transition-transform hover:scale-[1.01] active:scale-[0.99]"
        style={{
          background: "linear-gradient(135deg,#FF8C00,#FFD700)",
          boxShadow: "0 4px 28px rgba(255,140,0,0.4)",
        }}
      >
        {t.ctaStartStory}
      </button>
    </section>
  );
}
