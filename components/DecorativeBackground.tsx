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
    </>
  );
}
