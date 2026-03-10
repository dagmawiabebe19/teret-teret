"use client";

import { useMemo } from "react";

export function Stars() {
  const stars = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        x: (i * 37.3 + 11) % 100,
        y: (i * 53.7 + 7) % 100,
        size: (i % 3) + 1,
        delay: (i * 0.4) % 4,
        dur: 2 + (i % 3),
      })),
    []
  );
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden
    >
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white opacity-40"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            animation: `twinkle ${s.dur}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
