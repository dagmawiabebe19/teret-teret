"use client";

import { useTranslation } from "@/lib/useTranslation";
import type { Lang } from "@/types";

interface FAQSectionProps {
  lang: Lang;
}

export function FAQSection({ lang }: FAQSectionProps) {
  const { t } = useTranslation(lang);

  const items = t.faqItems;

  return (
    <section className="mb-14">
      <h2 className="font-fredoka text-[#FFD700] text-xl sm:text-2xl text-center mb-6">
        {t.faqHeadline}
      </h2>
      <div className="space-y-3">
        {items.map((item, i) => (
          <details
            key={i}
            className="rounded-xl border group"
            style={{
              background: "rgba(255,255,255,0.05)",
              borderColor: "rgba(255,215,0,0.15)",
            }}
          >
            <summary className="cursor-pointer list-none px-4 py-3.5 text-[14px] font-bold text-[#e8e0ff] flex justify-between gap-2">
              <span>{item.q}</span>
              <span className="text-[#FFD700] group-open:rotate-180 transition-transform">▾</span>
            </summary>
            <p className="px-4 pb-4 text-[13px] leading-relaxed text-[rgba(200,180,255,0.85)]">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
