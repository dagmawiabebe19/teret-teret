"use client";

const ANIMALS = [
  { emoji: "🦁", top: "12%", left: "8%", delay: "0s" },
  { emoji: "🐘", top: "22%", right: "6%", delay: "1.2s" },
  { emoji: "🦒", top: "55%", left: "4%", delay: "2.4s" },
  { emoji: "🦅", top: "38%", right: "10%", delay: "0.8s" },
];

export function FloatingAnimals() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-[0]" aria-hidden>
      {ANIMALS.map((a, i) => (
        <span
          key={i}
          className="absolute text-[clamp(28px,6vw,44px)] opacity-[0.18]"
          style={{
            top: a.top,
            left: a.left,
            right: a.right,
            animation: `floatBounce 6s ease-in-out infinite`,
            animationDelay: a.delay,
          }}
        >
          {a.emoji}
        </span>
      ))}
    </div>
  );
}
