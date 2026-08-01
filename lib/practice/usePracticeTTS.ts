"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Speak Practice partner replies via Azure English TTS (tap-driven / auto after reply). */
export function usePracticeTTS() {
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const stop = useCallback(() => {
    cleanup();
    setSpeaking(false);
    setLoading(false);
  }, [cleanup]);

  const speak = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      stop();
      setError(null);
      setLoading(true);

      try {
        const res = await fetch("/api/practice/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: trimmed }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setLoading(false);
          setError(data.error ?? "Audio unavailable");
          return;
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        urlRef.current = url;
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => {
          cleanup();
          setSpeaking(false);
        };
        audio.onerror = () => {
          cleanup();
          setSpeaking(false);
          setError("Audio unavailable");
        };
        await audio.play();
        setLoading(false);
        setSpeaking(true);
      } catch {
        setLoading(false);
        setSpeaking(false);
        setError("Audio unavailable");
      }
    },
    [stop, cleanup]
  );

  return { speak, stop, speaking, loading, error, clearError: () => setError(null) };
}
