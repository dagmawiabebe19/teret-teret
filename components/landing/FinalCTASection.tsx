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
    <section
      className="mb-12 rounded-[20px] border px-5 py-10 text-center"
      style={{
        background: "linear-gradient(180deg,rgba(26,5,51,0.95),rgba(13,13,43,0.98))",
        borderColor: "rgba(255,215,0,0.2)",
      }}
    >
      <h2
        className="font-fredoka text-[#FFD700] leading-snug mb-6 mx-auto max-w-[480px]"
        style={{ fontSize: "clamp(22px,5vw,32px)" }}
      >
        {t.finalCtaHeadline}
      </h2>
      <button
        type="button"
        onClick={() => {
          trackGenerateStoryCta("final_cta");
          onStartClick();
        }}
        className="w-full min-h-[56px] py-4 px-6 rounded-[14px] font-black font-fredoka text-[17px] text-[#1a0533]"
        style={{
          background: "linear-gradient(135deg,#FF8C00,#FFD700)",
          boxShadow: "0 4px 28px rgba(255,140,0,0.45)",
        }}
      >
        {t.finalCtaButton}
      </button>
    </section>
  );
}
