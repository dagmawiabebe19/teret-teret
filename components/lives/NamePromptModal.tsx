"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { SceneGeneratingStatus } from "@/components/lives/SceneGeneratingStatus";

interface NamePromptModalProps {
  scenarioTitle: string;
  loading?: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: (name: string) => void;
}

export function NamePromptModal({
  scenarioTitle,
  loading = false,
  error = null,
  onCancel,
  onConfirm,
}: NamePromptModalProps) {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading) inputRef.current?.focus();
  }, [loading]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || loading) return;
    onConfirm(trimmed);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[200] p-5"
      style={{ background: "rgba(0,0,0,0.85)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lives-name-title"
    >
      <form
        onSubmit={submit}
        className="w-full max-w-[360px] rounded-[28px] p-7 border-2 border-[rgba(255,215,0,0.45)]"
        style={{
          background: "linear-gradient(135deg,#1a1a4e,#2d1b69)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
          fontFamily: "'Nunito',sans-serif",
        }}
      >
        <h2
          id="lives-name-title"
          className="font-fredoka text-[#FFD700] text-[20px] mb-1 leading-tight"
        >
          Name your character
        </h2>
        <p className="text-[#c9b8e8] text-sm leading-relaxed mb-4">
          Starting <span className="text-[#FFD700]">{scenarioTitle}</span>
        </p>

        {loading ? (
          <div className="mb-4">
            <SceneGeneratingStatus compact />
          </div>
        ) : (
          <>
            <label className="block text-[12px] font-bold text-[rgba(200,180,255,0.75)] mb-1.5">
              Character name
            </label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              placeholder="e.g. Dawit"
              className="w-full min-h-[48px] rounded-xl px-4 text-[15px] text-[#e8e0ff] outline-none border border-[rgba(255,215,0,0.25)] focus:border-[#FFD700] mb-3"
              style={{ background: "rgba(0,0,0,0.25)" }}
            />
          </>
        )}

        {error && (
          <p className="text-[#ff6b6b] text-[13px] mb-3" role="alert">
            {error}
          </p>
        )}
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 min-h-[48px] rounded-full text-[14px] font-bold text-[#c9b8e8] border border-[rgba(255,215,0,0.2)] hover:border-[#FFD700] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="flex-1 min-h-[48px] rounded-full text-[14px] font-bold text-[#1a0533] disabled:opacity-50 transition-transform active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #FFB088, #FFD700)",
              boxShadow: "0 2px 12px rgba(255,140,0,0.25)",
            }}
          >
            {loading ? "Writing…" : "Begin"}
          </button>
        </div>
      </form>
    </div>
  );
}
