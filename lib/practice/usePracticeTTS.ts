"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Practice partner audio — same premium fetch/play pattern as bedtime useTTS
 * (POST → audio/mpeg blob → object URL → HTMLAudioElement.play).
 *
 * Bedtime plays on an explicit button tap (user gesture). Practice previously
 * auto-played after an async AI turn, so browsers blocked Audio.play()
 * (NotAllowedError) and we fell back to robotic speechSynthesis.
 * Fix: unlock HTMLAudioElement on mic tap, then premium play works.
 */
export function usePracticeTTS() {
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsTapToPlay, setNeedsTapToPlay] = useState(false);
  const [pendingText, setPendingText] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const unlockedRef = useRef(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const revokeUrl = useCallback(() => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  }, []);

  const ensureAudioEl = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    return audioRef.current;
  }, []);

  const cleanupPlayback = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
    const audio = audioRef.current;
    if (audio) {
      audio.onended = null;
      audio.onerror = null;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    revokeUrl();
  }, [revokeUrl]);

  useEffect(() => () => cleanupPlayback(), [cleanupPlayback]);

  const stop = useCallback(() => {
    cleanupPlayback();
    setSpeaking(false);
    setLoading(false);
  }, [cleanupPlayback]);

  /** Call from a user gesture (mic tap) so later autoplay of premium audio is allowed. */
  const unlock = useCallback(() => {
    // Already unlocked — skip silent play so we don't fight SpeechRecognition
    // for the audio device on later turns.
    if (unlockedRef.current) return;
    try {
      const audio = ensureAudioEl();
      // Silent unlock: play empty → pause. Must run inside click/touch handler.
      audio.src =
        "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=";
      const p = audio.play();
      if (p && typeof p.then === "function") {
        void p
          .then(() => {
            audio.pause();
            audio.currentTime = 0;
            unlockedRef.current = true;
          })
          .catch(() => {
            // Still mark attempt; some browsers unlock on the gesture alone.
            unlockedRef.current = true;
          });
      } else {
        unlockedRef.current = true;
      }
    } catch {
      unlockedRef.current = true;
    }
  }, [ensureAudioEl]);

  const speakBrowser = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setError("Couldn't play audio — you can still read the reply.");
      setLoading(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.92;
    const voices = window.speechSynthesis.getVoices();
    const en =
      voices.find((v) => v.lang.toLowerCase().startsWith("en-us")) ??
      voices.find((v) => v.lang.toLowerCase().startsWith("en"));
    if (en) utterance.voice = en;
    utterance.onend = () => {
      setSpeaking(false);
      utteranceRef.current = null;
    };
    utterance.onerror = () => {
      setSpeaking(false);
      utteranceRef.current = null;
    };
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setLoading(false);
    setSpeaking(true);
  }, []);

  const playBlob = useCallback(
    async (blob: Blob, textForFallback: string) => {
      const audio = ensureAudioEl();
      revokeUrl();
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      audio.src = url;
      audio.onended = () => {
        setSpeaking(false);
      };
      audio.onerror = () => {
        console.error("[practice/tts] client error: Audio element failed");
        setSpeaking(false);
        setNeedsTapToPlay(true);
        setPendingText(textForFallback);
        setError("Tap ▶ on the reply to hear it.");
      };

      try {
        await audio.play();
        setLoading(false);
        setSpeaking(true);
        setNeedsTapToPlay(false);
        setPendingText(null);
        setError(null);
      } catch (playErr) {
        console.error("[practice/tts] client error: play() blocked or failed", {
          name: playErr instanceof Error ? playErr.name : undefined,
          message: playErr instanceof Error ? playErr.message : String(playErr),
          unlocked: unlockedRef.current,
        });
        setLoading(false);
        setSpeaking(false);
        // Keep the blob URL — user can tap ▶ (user gesture) to play premium audio.
        setNeedsTapToPlay(true);
        setPendingText(textForFallback);
        setError("Tap ▶ on the reply to hear your partner.");
      }
    },
    [ensureAudioEl, revokeUrl]
  );

  const fetchAndPlay = useCallback(
    async (text: string, { fromUserGesture }: { fromUserGesture: boolean }) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      const audio = ensureAudioEl();
      audio.pause();

      setError(null);
      setLoading(true);
      setNeedsTapToPlay(false);

      try {
        // Same request shape bedtime useTTS uses for English premium audio
        const res = await fetch("/api/practice/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: trimmed }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          console.error("[practice/tts] client error: premium request failed", {
            status: res.status,
            body: data,
          });
          setLoading(false);
          if (res.status === 429 || data.ttsDailyLimit) {
            setError(
              data.error ??
                "Daily audio limit reached. You can still read the reply."
            );
            return;
          }
          // Soft fallback only when API truly failed
          if (fromUserGesture) {
            speakBrowser(trimmed);
            setError("Couldn't play premium audio — using device voice.");
          } else {
            setNeedsTapToPlay(true);
            setPendingText(trimmed);
            setError("Tap ▶ on the reply to hear your partner.");
          }
          return;
        }

        const blob = await res.blob();
        if (!blob.size) {
          console.error("[practice/tts] client error: empty audio blob", {
            status: res.status,
            contentType: res.headers.get("content-type"),
          });
          setLoading(false);
          setNeedsTapToPlay(true);
          setPendingText(trimmed);
          setError("Tap ▶ on the reply to hear your partner.");
          return;
        }

        await playBlob(blob, trimmed);
      } catch (err) {
        console.error("[practice/tts] client error: fetch threw", err);
        setLoading(false);
        if (fromUserGesture) {
          speakBrowser(trimmed);
          setError("Couldn't play premium audio — using device voice.");
        } else {
          setNeedsTapToPlay(true);
          setPendingText(trimmed);
          setError("Tap ▶ on the reply to hear your partner.");
        }
      }
    },
    [ensureAudioEl, playBlob, speakBrowser]
  );

  /** Auto after partner reply (may be blocked — then show tap-to-play). */
  const speak = useCallback(
    (text: string) => {
      void fetchAndPlay(text, { fromUserGesture: false });
    },
    [fetchAndPlay]
  );

  /** Explicit tap on ▶ — user gesture, same as bedtime play button. */
  const speakFromTap = useCallback(
    (text?: string) => {
      unlock();
      const t = (text ?? pendingText ?? "").trim();
      if (!t) return;
      void fetchAndPlay(t, { fromUserGesture: true });
    },
    [unlock, pendingText, fetchAndPlay]
  );

  /** Replay currently loaded premium audio under a user gesture (no re-fetch). */
  const replayLoaded = useCallback(async () => {
    const audio = audioRef.current;
    if (audio?.src && urlRef.current) {
      try {
        audio.currentTime = 0;
        await audio.play();
        setSpeaking(true);
        setNeedsTapToPlay(false);
        setError(null);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }, []);

  return {
    speak,
    speakFromTap,
    replayLoaded,
    unlock,
    stop,
    speaking,
    loading,
    error,
    needsTapToPlay,
    pendingText,
    clearError: () => setError(null),
  };
}
