"use client";

import type { Lang } from "@/types";

const opts: { v: Lang; label: string }[] = [
  { v: "am", label: "አማ" },
  { v: "en", label: "EN" },
  { v: "es", label: "ES" },
];

interface LangToggleProps {
  lang: Lang;
  setLang: (l: Lang) => void;
  style?: React.CSSProperties;
}

export function LangToggle({ lang, setLang, style = {} }: LangToggleProps) {
  return (
    <div
      className="flex rounded-[22px] p-[3px] gap-0.5 border border-[rgba(255,215,0,0.18)]"
      style={{
        background: "rgba(255,255,255,0.09)",
        ...style,
      }}
      role="group"
      aria-label="Select language"
    >
      {opts.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => setLang(o.v)}
          aria-pressed={lang === o.v}
          aria-label={o.v === "am" ? "Amharic" : o.v === "en" ? "English" : "Spanish"}
          className="min-w-[32px] text-center rounded-2xl border-none cursor-pointer text-[11px] font-extrabold transition-all duration-200"
          style={{
            padding: "5px 11px",
            fontFamily: "'Nunito',sans-serif",
            background:
              lang === o.v
                ? "linear-gradient(135deg,#7b2d8b,#c44dff)"
                : "transparent",
            color: lang === o.v ? "#fff" : "rgba(255,215,0,0.5)",
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
