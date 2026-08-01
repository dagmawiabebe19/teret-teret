"use client";

interface SpeakButtonProps {
  clipKey: string;
  text: string;
  lang: "am" | "en";
  playingKey: string | null;
  loadingKey: string | null;
  onSpeak: (key: string, text: string, lang: "am" | "en") => void;
  label: string;
  size?: "sm" | "md";
}

export function LivesSpeakButton({
  clipKey,
  text,
  lang,
  playingKey,
  loadingKey,
  onSpeak,
  label,
  size = "md",
}: SpeakButtonProps) {
  const isLoading = loadingKey === clipKey;
  const isPlaying = playingKey === clipKey;
  const dim = size === "sm" ? "w-8 h-8 text-[13px]" : "w-10 h-10 text-[15px]";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onSpeak(clipKey, text, lang);
      }}
      aria-label={isPlaying ? `Stop: ${label}` : label}
      title={isPlaying ? "Stop" : label}
      className={`${dim} shrink-0 inline-flex items-center justify-center rounded-full border transition-colors tap-zone ${
        isPlaying
          ? "border-[#FFD700] bg-[rgba(255,215,0,0.2)] text-[#FFD700]"
          : "border-[rgba(255,215,0,0.3)] bg-[rgba(255,255,255,0.06)] text-[#c9b8e8] hover:border-[#FFD700] hover:text-[#FFD700]"
      }`}
    >
      {isLoading ? (
        <span className="animate-pulse" aria-hidden>
          …
        </span>
      ) : isPlaying ? (
        <span aria-hidden>■</span>
      ) : (
        <span aria-hidden>🔊</span>
      )}
    </button>
  );
}
