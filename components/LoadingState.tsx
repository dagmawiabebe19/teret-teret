"use client";

import { Campfire } from "./Campfire";
import { ANIMALS, getT } from "@/lib/constants";
import type { Lang } from "@/types";

interface LoadingStateProps {
  lang: Lang;
  loadingMsg: number;
  loadingProgress: number;
}

export function LoadingState({
  lang,
  loadingMsg,
  loadingProgress,
}: LoadingStateProps) {
  const t = getT(lang);
  const loadingMessages = t.loading;

  return (
    <div
      className="min-h-[85vh] flex flex-col items-center justify-center"
      style={{ animation: "fadeSlideUp 0.4s ease forwards" }}
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className="text-[82px] mb-4"
        style={{
          animation: "pulse 1.4s ease-in-out infinite",
          filter: "drop-shadow(0 0 24px rgba(255,215,0,0.6))",
        }}
        aria-hidden
      >
        📖
      </div>
      <div className="flex gap-3 mb-6 text-[30px]">
        {ANIMALS.map((a, i) => (
          <span
            key={i}
            className="inline-block"
            style={{
              animation: "floatBounce 0.9s ease-in-out infinite",
              animationDelay: `${i * 0.11}s`,
            }}
            aria-hidden
          >
            {a}
          </span>
        ))}
      </div>
      <div
        className="rounded-[18px] py-3 px-6 mb-6 text-center border min-w-[250px] max-w-[310px]"
        style={{
          background: "rgba(255,255,255,0.08)",
          borderColor: "rgba(255,215,0,0.18)",
        }}
      >
        <div className="text-[26px] mb-1" aria-hidden>
          {ANIMALS[loadingMsg % ANIMALS.length]}
        </div>
        <p
          className="text-[#FFD700] text-[13px] font-extrabold leading-snug"
          style={{ fontFamily: "'Nunito',sans-serif" }}
        >
          {loadingMessages[loadingMsg]}
        </p>
      </div>
      <div
        className="w-[250px] h-[11px] rounded-full overflow-hidden border"
        style={{
          background: "rgba(255,255,255,0.09)",
          borderColor: "rgba(255,215,0,0.18)",
        }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{
            width: `${loadingProgress}%`,
            background: "linear-gradient(90deg,#c44dff,#FFD700)",
            boxShadow: "0 0 9px rgba(196,77,255,0.45)",
          }}
        />
      </div>
      <p className="text-[rgba(255,255,255,0.28)] text-[11px] mt-1 font-bold">
        {Math.round(loadingProgress)}%
      </p>
    </div>
  );
}
