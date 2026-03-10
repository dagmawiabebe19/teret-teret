"use client";

const FLOAT_ITEMS: [string, string, "right" | "left", string, string][] = [
  ["🦁", "8%", "right", "8%", "0s"],
  ["🐘", "15%", "left", "5%", "1s"],
  ["🦒", "20%", "right", "4%", "0.5s"],
  ["🦅", "40%", "left", "2%", "1.5s"],
];

export function DecorativeBackground() {
  return (
    <>
      {FLOAT_ITEMS.map(([emoji, top, side, pos, delay], i) => (
        <div
          key={i}
          className="fixed text-[22px] opacity-[0.08] pointer-events-none z-0"
          style={{
            top,
            [side]: pos,
            animation: "floatBounce 3s ease-in-out infinite",
            animationDelay: delay,
          }}
          aria-hidden
        >
          {emoji}
        </div>
      ))}
      <div
        className="fixed top-4 right-4 text-[44px] z-[2] pointer-events-none"
        style={{
          animation: "pulse 4s ease-in-out infinite",
          filter: "drop-shadow(0 0 16px rgba(255,220,100,0.4))",
        }}
        aria-hidden
      >
        🌙
      </div>
    </>
  );
}
