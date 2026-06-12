"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/useTranslation";
import type { Lang } from "@/types";

interface PostStorySignupPromptProps {
  lang: Lang;
  childName: string;
  googleLoading?: boolean;
  onGoogleClick: () => void;
  onDismiss: () => void;
}

export function PostStorySignupPrompt({
  lang,
  childName,
  googleLoading = false,
  onGoogleClick,
  onDismiss,
}: PostStorySignupPromptProps) {
  const { t } = useTranslation(lang);
  const displayName = childName.trim() || (lang === "am" ? "ልጅሽ" : lang === "es" ? "tu hijo" : "your child");

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(8, 4, 24, 0.72)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="signup-prompt-headline"
    >
      <div
        className="w-full max-w-[360px] rounded-[24px] border p-6 text-center shadow-2xl"
        style={{
          background: "linear-gradient(165deg, #1a1a4e 0%, #2d1b69 55%, #1a0a33 100%)",
          borderColor: "rgba(255,215,0,0.28)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.45), 0 0 40px rgba(255,215,0,0.08)",
        }}
      >
        <p className="text-[32px] mb-3" aria-hidden>
          ✨
        </p>
        <h2
          id="signup-prompt-headline"
          className="text-[20px] font-bold text-[#FFD700] leading-snug mb-2"
          style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
        >
          {t.signupPromptHeadline(displayName)}
        </h2>
        <p
          className="text-[14px] text-[rgba(232,224,255,0.88)] leading-relaxed mb-5"
          style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
        >
          {t.signupPromptSubheadline}
        </p>
        <ul className="text-left text-[13px] text-[rgba(200,180,255,0.85)] space-y-2 mb-6">
          {[t.signupPromptBenefit1, t.signupPromptBenefit2, t.signupPromptBenefit3].map((line) => (
            <li key={line} className="flex gap-2 items-start">
              <span className="text-[#FFD700] shrink-0">✓</span>
              <span style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}>{line}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onGoogleClick}
          disabled={googleLoading}
          className="w-full min-h-[52px] py-3 px-4 rounded-[16px] font-bold text-[15px] text-[#1a0533] disabled:opacity-70 flex items-center justify-center gap-2 mb-3"
          style={{
            background: "linear-gradient(135deg,#FF8C00,#FFD700)",
            boxShadow: "0 4px 20px rgba(255,140,0,0.35)",
            fontFamily: "'Nunito', system-ui, sans-serif",
          }}
        >
          {googleLoading ? (
            "…"
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {t.continueWithGoogle}
            </>
          )}
        </button>
        <Link
          href="/account?mode=signup&from=prompt"
          onClick={() => {
            try {
              sessionStorage.setItem("signup_from_prompt", "1");
            } catch {
              // ignore
            }
          }}
          className="block text-[13px] font-medium text-[var(--color-peach)] hover:text-[#FFD700] transition-colors mb-4 no-underline"
          style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
        >
          {t.signupPromptEmailLink}
        </Link>
        <button
          type="button"
          onClick={onDismiss}
          className="text-[12px] text-[rgba(200,180,255,0.45)] hover:text-[rgba(200,180,255,0.7)] transition-colors bg-transparent border-none cursor-pointer"
          style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
        >
          {t.signupPromptDismiss}
        </button>
      </div>
    </div>
  );
}
