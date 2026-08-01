"use client";

import { useEffect, useState } from "react";

const STATUS_LINES = [
  "Setting the scene…",
  "A new day begins…",
  "Deciding what happens next…",
  "The story unfolds…",
  "Listening for the next beat…",
];

interface SceneGeneratingStatusProps {
  /** Slightly denser layout for the name modal */
  compact?: boolean;
}

export function SceneGeneratingStatus({ compact = false }: SceneGeneratingStatusProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % STATUS_LINES.length);
    }, 2000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      className={`rounded-2xl border border-[rgba(255,215,0,0.22)] text-center ${
        compact ? "px-3 py-3" : "px-4 py-5"
      }`}
      style={{ background: "rgba(255,255,255,0.04)" }}
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex justify-center gap-1.5 mb-3" aria-hidden>
        <span
          className="w-2 h-2 rounded-full bg-[#FFD700]"
          style={{ animation: "livesPulse 1.1s ease-in-out infinite" }}
        />
        <span
          className="w-2 h-2 rounded-full bg-[#FFB088]"
          style={{ animation: "livesPulse 1.1s ease-in-out infinite 0.2s" }}
        />
        <span
          className="w-2 h-2 rounded-full bg-[#c9b8e8]"
          style={{ animation: "livesPulse 1.1s ease-in-out infinite 0.4s" }}
        />
      </div>
      <p
        key={index}
        className={`font-bold text-[#FFD700] ${compact ? "text-[13px]" : "text-[15px]"}`}
        style={{ animation: "fadeSlideUp 0.35s ease-out" }}
      >
        {STATUS_LINES[index]}
      </p>
      {!compact && (
        <p className="text-[12px] text-[rgba(200,180,255,0.6)] mt-1.5">
          Your choice is being written into the story
        </p>
      )}
    </div>
  );
}
