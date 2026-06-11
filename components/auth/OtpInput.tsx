"use client";

import { useRef, useCallback, KeyboardEvent, ClipboardEvent, ChangeEvent } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  onComplete?: (code: string) => void;
};

const LENGTH = 6;

export function OtpInput({ value, onChange, disabled, onComplete }: Props) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const chars = Array.from({ length: LENGTH }, (_, i) => value[i] ?? "");

  const setDigitAt = useCallback(
    (index: number, char: string) => {
      const arr = Array.from({ length: LENGTH }, (_, i) => value[i] ?? "");
      arr[index] = char;
      const next = arr.join("").slice(0, LENGTH);
      onChange(next);
      if (next.length === LENGTH) onComplete?.(next);
    },
    [value, onChange, onComplete]
  );

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) {
      setDigitAt(index, "");
      return;
    }
    if (raw.length > 1) {
      const pasted = raw.slice(0, LENGTH);
      onChange(pasted);
      const focusIdx = Math.min(pasted.length, LENGTH - 1);
      inputsRef.current[focusIdx]?.focus();
      if (pasted.length === LENGTH) onComplete?.(pasted);
      return;
    }
    setDigitAt(index, raw);
    if (index < LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !chars[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
      setDigitAt(index - 1, "");
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!pasted) return;
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, LENGTH - 1);
    inputsRef.current[focusIdx]?.focus();
    if (pasted.length === LENGTH) onComplete?.(pasted);
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3" role="group" aria-label="Verification code">
      {Array.from({ length: LENGTH }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={6}
          disabled={disabled}
          value={chars[i]}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          aria-label={`Digit ${i + 1}`}
          className="w-12 h-14 sm:w-14 sm:h-14 text-center text-2xl font-bold rounded-xl border-2 border-[rgba(212,175,55,0.4)] bg-[rgba(255,255,255,0.06)] text-white outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[rgba(212,175,55,0.3)] disabled:opacity-50"
        />
      ))}
    </div>
  );
}
