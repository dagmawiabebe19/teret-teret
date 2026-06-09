"use client";

import { useMemo } from "react";
import type { Lang } from "@/types";
import { getTranslations } from "./translations";

/**
 * Returns UI strings for the given language.
 * Pass `lang` from parent state (synced with localStorage `teret_lang`).
 */
export function useTranslation(lang: Lang) {
  const t = useMemo(() => getTranslations(lang), [lang]);
  return { t, lang };
}
