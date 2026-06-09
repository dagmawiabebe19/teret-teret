"use client";

import { useEffect, useState } from "react";
import { InstallPrompt, ServiceWorkerRegister } from "@/components/InstallPrompt";
import type { Lang } from "@/types";

export function InstallPromptShell() {
  const [lang, setLang] = useState<Lang>("en");
  const [storyReaderActive, setStoryReaderActive] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("teret_lang");
    if (stored === "am" || stored === "en" || stored === "es") {
      setLang(stored);
    }
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      setStoryReaderActive(Boolean((e as CustomEvent<boolean>).detail));
    };
    window.addEventListener("teret:story-reader-active", handler);
    return () => window.removeEventListener("teret:story-reader-active", handler);
  }, []);

  return (
    <>
      <ServiceWorkerRegister />
      <InstallPrompt lang={lang} storyReaderActive={storyReaderActive} />
    </>
  );
}
