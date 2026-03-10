"use client";

import { useMemo } from "react";

export function Fireflies() {
  const flies = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        id: i,
        x: 10 + (i * 71.3) % 80,
        y: 10 + (i * 53.7) % 75,
        tx: (-30 + (i * 47) % 60) + "px",
        ty: (-40 + (i * 31) % 80) + "px",
        tx2: (20 + (i * 29) % 50) + "px",
        ty2: (10 + (i * 61) % 60) + "px",
        dur: 5 + (i % 4),
        delay: (i * 0.8) % 6,
        size: 2 + (i % 2),
      })),
    []
  );
  return (
    <div className="fixed inset-0 pointer-events-none z-[1]" aria-hidden>
      {flies.map((f) => (
        <div
          key={f.id}
          className="absolute rounded-full bg-[#c8b0ff]"
          style={{
            left: `${f.x}%`,
            top: `${f.y}%`,
            width: f.size,
            height: f.size,
            boxShadow: "0 0 5px 2px rgba(180,140,255,0.55)",
            ["--tx" as string]: f.tx,
            ["--ty" as string]: f.ty,
            ["--tx2" as string]: f.tx2,
            ["--ty2" as string]: f.ty2,
            animation: `fireflyMove ${f.dur}s ease-in-out infinite`,
            animationDelay: `${f.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
