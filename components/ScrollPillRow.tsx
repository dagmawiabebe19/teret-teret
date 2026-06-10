"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface ScrollPillRowProps {
  hint?: string;
  children: React.ReactNode;
}

export function ScrollPillRow({ hint, children }: ScrollPillRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showHint, setShowHint] = useState(false);

  const checkOverflow = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    setShowHint(el.scrollWidth > el.clientWidth + 4);
  }, []);

  useEffect(() => {
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [checkOverflow, children]);

  const onScroll = () => {
    if (showHint) setShowHint(false);
  };

  return (
    <div className="relative">
      <div
        ref={rowRef}
        className="scroll-pill-row flex gap-2 pb-1 -mx-1 px-1"
        onScroll={onScroll}
      >
        {children}
      </div>
      {showHint && hint && (
        <p className="mt-1.5 text-[12px] text-[var(--color-peach)] font-medium text-right pr-1 animate-pulse">
          {hint}
        </p>
      )}
    </div>
  );
}

interface PillButtonProps {
  active: boolean;
  emoji: string;
  label: string;
  onClick: () => void;
}

export function PillButton({ active, emoji, label, onClick }: PillButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="scroll-pill-item shrink-0 flex items-center gap-2 h-11 min-h-[44px] px-4 rounded-full text-[15px] font-medium transition-all duration-200"
      style={{
        scrollSnapAlign: "start",
        background: active ? "rgba(255,215,0,0.12)" : "rgba(255,255,255,0.06)",
        border: `2px solid ${active ? "#FFD700" : "rgba(255,255,255,0.14)"}`,
        color: active ? "#FFD700" : "#d4c4f0",
        boxShadow: active ? "0 0 16px rgba(255,215,0,0.2)" : "none",
        transform: active ? "scale(1.03)" : "scale(1)",
      }}
      aria-pressed={active}
    >
      <span className="text-lg leading-none" aria-hidden>
        {emoji}
      </span>
      <span>{label}</span>
    </button>
  );
}
