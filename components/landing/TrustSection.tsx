"use client";

import { useTranslation } from "@/lib/useTranslation";
import type { Lang } from "@/types";

interface TrustSectionProps {
  lang: Lang;
}

export function TrustSection({ lang }: TrustSectionProps) {
  const { t } = useTranslation(lang);
  const items = [
    { icon: "🎙️", label: t.trustNarration },
    { icon: "🇪🇹", label: t.trustHeritage },
    { icon: "🛡️", label: t.trustSafe },
  ];

  return (
    <section className="mb-12">
      <div className="grid grid-cols-3 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-[20px] py-4 px-2 text-center"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <span className="text-2xl block mb-2" aria-hidden>
              {item.icon}
            </span>
            <p className="text-[12px] sm:text-[13px] font-medium text-[#e0d4ff] leading-snug">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
