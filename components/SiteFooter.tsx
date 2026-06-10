"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/useTranslation";
import type { Lang } from "@/types";

interface SiteFooterProps {
  lang: Lang;
}

export function SiteFooter({ lang }: SiteFooterProps) {
  const { t } = useTranslation(lang);

  return (
    <footer className="text-center py-8 border-t border-[rgba(255,255,255,0.08)]">
      <p className="text-[14px] font-medium text-[#c9b8e8] mb-3">{t.footerNoAds}</p>
      <Link
        href="/faq"
        className="text-[14px] font-medium text-[var(--color-peach)] hover:text-[#FFD700] transition-colors no-underline"
      >
        {t.footerFaqLink}
      </Link>
    </footer>
  );
}
