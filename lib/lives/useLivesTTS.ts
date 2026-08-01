"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type LivesTtsLang = "am" | "en";

/**
 * Tap-to-play Azure audio for Lives (Amharic scene / English phrases).
 * Uses /api/lives/tts — does not touch bedtime /api/tts.
 */
export function useLivesTTS() {
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const stop = useCallback(() => {
    cleanup();
    setPlayingKey(null);
    setLoadingKey(null);
  }, [cleanup]);

  const speak = useCallback(
    async (key: string, text: string, lang: LivesTtsLang) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      if (playingKey === key || loadingKey === key) {
        stop();
        return;
      }

      stop();
      setError(null);
      setLoadingKey(key);

      try {
        const res = await fetch("/api/lives/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: trimmed, lang }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setLoadingKey(null);
          setError(
            data.error ?? "Audio temporarily unavailable. Please try again."
          );
          return;
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => {
          cleanup();
          setPlayingKey(null);
        };
        audio.onerror = () => {
          cleanup();
          setPlayingKey(null);
          setError("Audio temporarily unavailable. Please try again.");
        };
        await audio.play();
        setLoadingKey(null);
        setPlayingKey(key);
      } catch {
        setLoadingKey(null);
        setPlayingKey(null);
        setError("Audio temporarily unavailable. Please try again.");
      }
    },
    [playingKey, loadingKey, stop, cleanup]
  );

  return {
    speak,
    stop,
    playingKey,
    loadingKey,
    error,
    clearError: () => setError(null),
  };
}
