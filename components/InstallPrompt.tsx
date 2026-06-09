"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@/lib/useTranslation";
import type { Lang } from "@/types";
import {
  canShowInstallPrompt,
  detectInstallPlatform,
  dismissInstallPrompt,
  type InstallPlatform,
} from "@/lib/installPrompt";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Non-fatal; install prompt may still work on some platforms.
    });
  }, []);
  return null;
}

interface InstallPromptProps {
  lang: Lang;
  storyReaderActive?: boolean;
}

export function InstallPrompt({ lang, storyReaderActive = false }: InstallPromptProps) {
  const { t } = useTranslation(lang);
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<InstallPlatform>("other");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  const evaluate = useCallback(
    (prompt: BeforeInstallPromptEvent | null = deferredPrompt) => {
      if (storyReaderActive) {
        setVisible(false);
        return;
      }
      const p = detectInstallPlatform();
      setPlatform(p);
      const eligible = canShowInstallPrompt() && p !== "other";
      const androidReady = p !== "android" || prompt !== null;
      setVisible(eligible && androidReady);
    },
    [storyReaderActive, deferredPrompt]
  );

  useEffect(() => {
    evaluate();
  }, [evaluate]);

  useEffect(() => {
    const onPage2 = () => evaluate();
    const onDismiss = () => setVisible(false);
    const onReader = (e: Event) => {
      const active = (e as CustomEvent<boolean>).detail;
      if (active) setVisible(false);
      else evaluate();
    };
    window.addEventListener("teret:first-story-page2", onPage2);
    window.addEventListener("teret:install-prompt-dismissed", onDismiss);
    window.addEventListener("teret:story-reader-active", onReader);
    return () => {
      window.removeEventListener("teret:first-story-page2", onPage2);
      window.removeEventListener("teret:install-prompt-dismissed", onDismiss);
      window.removeEventListener("teret:story-reader-active", onReader);
    };
  }, [evaluate]);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      const prompt = e as BeforeInstallPromptEvent;
      setDeferredPrompt(prompt);
      evaluate(prompt);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [evaluate]);

  const handleDismiss = () => {
    dismissInstallPrompt();
    setVisible(false);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    dismissInstallPrompt();
    setVisible(false);
  };

  if (!visible) return null;

  const isAndroid = platform === "android";

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[90] px-4 pb-4 pointer-events-none"
      role="region"
      aria-label={t.installPromptAriaLabel}
    >
      <div
        className="pointer-events-auto mx-auto max-w-lg rounded-2xl border px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.45)] animate-install-prompt"
        style={{
          background: "linear-gradient(135deg,rgba(26,5,51,0.97),rgba(45,27,105,0.97))",
          borderColor: "rgba(255,215,0,0.28)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[13px] leading-snug text-[#e8e0ff]">
              {isAndroid ? t.installPromptAndroid : t.installPromptIos}
            </p>
            {isAndroid && deferredPrompt && (
              <button
                type="button"
                onClick={handleInstall}
                className="mt-2 px-3.5 py-1.5 rounded-lg text-[12px] font-black"
                style={{
                  background: "linear-gradient(135deg,#FF8C00,#FFD700)",
                  color: "#1a0533",
                }}
              >
                {t.installPromptInstallBtn}
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[rgba(200,180,255,0.7)] hover:text-[#FFD700] hover:bg-[rgba(255,255,255,0.08)] transition-colors"
            aria-label={t.installPromptDismiss}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
