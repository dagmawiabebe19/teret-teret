"use client";

import type { LifeStats } from "@/lib/lives/types";

const STAT_META: Array<{
  key: string;
  icon: string;
  label: string;
  money?: boolean;
}> = [
  { key: "health", icon: "❤️", label: "Health" },
  { key: "money", icon: "💰", label: "Money", money: true },
  { key: "reputation", icon: "⭐", label: "Reputation" },
  { key: "intelligence", icon: "📚", label: "Intelligence" },
  { key: "strength", icon: "💪", label: "Strength" },
  { key: "happiness", icon: "😊", label: "Happiness" },
  { key: "energy", icon: "⚡", label: "Energy" },
];

function formatMoney(n: number): string {
  const rounded = Math.round(n);
  const abs = Math.abs(rounded).toLocaleString("en-US");
  return rounded < 0 ? `-$${abs}` : `$${abs}`;
}

interface StatsHeaderProps {
  name: string;
  age: number;
  stats: LifeStats;
}

export function StatsHeader({ name, age, stats }: StatsHeaderProps) {
  return (
    <div
      className="sticky top-14 z-[15] border-b border-[rgba(255,215,0,0.1)] px-4 py-2.5"
      style={{
        background: "rgba(13,13,43,0.92)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="max-w-[640px] mx-auto">
        <div className="flex items-baseline justify-between gap-2 mb-2">
          <h1 className="font-fredoka text-[#FFD700] text-[16px] sm:text-[18px] truncate">
            {name}
          </h1>
          <span className="text-[12px] font-bold text-[#c9b8e8] shrink-0">
            Age {age}
          </span>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1.5">
          {STAT_META.map(({ key, icon, label, money }) => {
            const raw = stats[key];
            const value = typeof raw === "number" && Number.isFinite(raw) ? raw : 0;
            if (money) {
              return (
                <div
                  key={key}
                  className="flex items-center gap-1 text-[11px] sm:text-[12px] font-bold"
                  title={label}
                >
                  <span aria-hidden>{icon}</span>
                  <span className={value < 0 ? "text-[#ff6b6b]" : "text-[#FFD700]"}>
                    {formatMoney(value)}
                  </span>
                </div>
              );
            }
            const pct = Math.max(0, Math.min(100, value));
            return (
              <div
                key={key}
                className="flex items-center gap-1 min-w-[72px]"
                title={`${label}: ${Math.round(value)}`}
              >
                <span className="text-[11px]" aria-hidden>
                  {icon}
                </span>
                <div className="flex-1 h-1.5 rounded-full bg-[rgba(255,255,255,0.12)] overflow-hidden min-w-[36px]">
                  <div
                    className="h-full rounded-full transition-[width] duration-500 ease-out"
                    style={{
                      width: `${pct}%`,
                      background:
                        pct < 25
                          ? "linear-gradient(90deg,#ff6b6b,#ff8e53)"
                          : "linear-gradient(90deg,#FFB088,#FFD700)",
                    }}
                  />
                </div>
                <span className="text-[10px] font-bold text-[#c9b8e8] w-5 text-right">
                  {Math.round(value)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
