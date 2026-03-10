"use client";

export function Campfire({ size = 1 }: { size?: number }) {
  const s = size;
  const flames = [
    {
      l: "50%",
      ml: -7 * s,
      w: 14 * s,
      h: 38 * s,
      color: "#FF6B00",
      dur: "0.9s",
      delay: "0s",
    },
    {
      l: "30%",
      ml: -5 * s,
      w: 10 * s,
      h: 28 * s,
      color: "#FFB300",
      dur: "1.1s",
      delay: "0.15s",
    },
    {
      l: "68%",
      ml: -5 * s,
      w: 10 * s,
      h: 24 * s,
      color: "#FF8C00",
      dur: "0.8s",
      delay: "0.3s",
    },
    {
      l: "50%",
      ml: -4 * s,
      w: 8 * s,
      h: 16 * s,
      color: "#FFE066",
      dur: "0.7s",
      delay: "0.1s",
    },
  ];
  return (
    <div className="flex flex-col items-center" aria-hidden>
      <div className="relative" style={{ width: 44 * s, height: 50 * s }}>
        {flames.map((f, i) => (
          <div
            key={i}
            className="absolute bottom-0 rounded-b-full opacity-90"
            style={{
              left: f.l,
              marginLeft: f.ml,
              width: f.w,
              height: f.h,
              background: `radial-gradient(ellipse at 50% 100%,${f.color},transparent)`,
              borderRadius: "50% 50% 20% 20%",
              animation: `fireFlicker ${f.dur} ease-in-out infinite`,
              animationDelay: f.delay,
              transformOrigin: "bottom center",
            }}
          />
        ))}
      </div>
      <div className="flex gap-1" style={{ gap: 3 * s }}>
        {["#5c2e00", "#7a3d00", "#4a2200"].map((c, i) => (
          <div
            key={i}
            className="rounded"
            style={{
              width: 14 * s,
              height: 7 * s,
              background: c,
              borderRadius: 4 * s,
            }}
          />
        ))}
      </div>
      <div
        className="rounded-full mt-0.5"
        style={{
          width: 80 * s,
          height: 14 * s,
          background:
            "radial-gradient(ellipse,rgba(255,140,0,0.18) 0%,transparent 70%)",
          marginTop: 2 * s,
        }}
      />
    </div>
  );
}
