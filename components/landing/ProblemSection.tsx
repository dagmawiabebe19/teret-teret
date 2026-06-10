"use client";

import { useTranslation } from "@/lib/useTranslation";
import type { Lang } from "@/types";

export function ProblemSection({ lang }: { lang: Lang }) {
  const { t } = useTranslation(lang);
  return (
    <section className="mb-12 text-center px-1">
      <h2 className="font-fredoka text-[#FFD700] text-xl sm:text-2xl leading-snug mb-4 max-w-[520px] mx-auto">
        {t.problemHeadline}
      </h2>
      <p className="text-[15px] leading-relaxed text-[#c9b8e8] max-w-[520px] mx-auto">
        {t.problemBody}
      </p>
    </section>
  );
}
