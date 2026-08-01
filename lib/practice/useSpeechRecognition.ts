"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  onnomatch: (() => void) | null;
  onstart: (() => void) | null;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
};

function getSpeechRecognitionCtor():
  | (new () => SpeechRecognitionLike)
  | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** Browser needs a beat after abort/end before a new instance can start. */
const RESTART_SETTLE_MS = 180;

export function useSpeechRecognition() {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);

  /** Bumped to invalidate stale recognizer callbacks across turns. */
  const sessionRef = useRef(0);
  const recogRef = useRef<SpeechRecognitionLike | null>(null);
  const listeningRef = useRef(false);
  const finalRef = useRef("");
  const onFinalRef = useRef<((text: string) => void) | null>(null);
  const startQueuedRef = useRef(false);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endingWaitRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSupported(Boolean(getSpeechRecognitionCtor()));
  }, []);

  const clearTimers = useCallback(() => {
    if (settleTimerRef.current) {
      clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }
    if (endingWaitRef.current) {
      clearTimeout(endingWaitRef.current);
      endingWaitRef.current = null;
    }
  }, []);

  const markReady = useCallback(() => {
    listeningRef.current = false;
    setListening(false);
    setInterim("");
    recogRef.current = null;
  }, []);

  /**
   * Abort any active recognizer and invalidate its session so late
   * onerror/onend/aborted events cannot flip UI state for the next turn.
   */
  const tearDownActive = useCallback(
    (reason: string): Promise<void> => {
      clearTimers();
      startQueuedRef.current = false;

      const prev = recogRef.current;
      // Invalidate first so any in-flight callbacks from `prev` are ignored.
      sessionRef.current += 1;
      recogRef.current = null;
      listeningRef.current = false;
      setListening(false);
      setInterim("");
      finalRef.current = "";

      if (!prev) {
        console.log(`[practice/mic] teardown: ${reason} (idle)`);
        return Promise.resolve();
      }

      console.log(`[practice/mic] teardown: ${reason}`);

      return new Promise((resolve) => {
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          if (endingWaitRef.current) {
            clearTimeout(endingWaitRef.current);
            endingWaitRef.current = null;
          }
          // Detach so a late abort error does not log as a live session.
          prev.onresult = null;
          prev.onerror = null;
          prev.onend = null;
          prev.onnomatch = null;
          prev.onstart = null;
          resolve();
        };

        prev.onend = () => finish();
        prev.onerror = () => {
          // Chrome usually follows aborted with onend; finish on timeout if not.
        };

        try {
          prev.abort();
        } catch {
          try {
            prev.stop();
          } catch {
            finish();
            return;
          }
        }

        endingWaitRef.current = setTimeout(finish, RESTART_SETTLE_MS + 50);
      });
    },
    [clearTimers]
  );

  const stop = useCallback(() => {
    void tearDownActive("user-stop");
    onFinalRef.current = null;
  }, [tearDownActive]);

  const beginSession = useCallback(
    (onFinal: (text: string) => void) => {
      const Ctor = getSpeechRecognitionCtor();
      if (!Ctor) {
        setError("Speech recognition is not available on this browser.");
        markReady();
        return;
      }

      setError(null);
      setInterim("");
      finalRef.current = "";
      onFinalRef.current = onFinal;

      const mySession = ++sessionRef.current;
      const recognition = new Ctor();
      recognition.lang = "en-US";
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      const isLive = () => mySession === sessionRef.current;

      recognition.onstart = () => {
        if (!isLive()) return;
        listeningRef.current = true;
        setListening(true);
        console.log("[practice/mic] started session", mySession);
      };

      recognition.onresult = (event) => {
        if (!isLive()) return;
        let interimText = "";
        let finalText = finalRef.current;
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const piece = result[0]?.transcript ?? "";
          if (result.isFinal) {
            finalText = `${finalText} ${piece}`.trim();
          } else {
            interimText += piece;
          }
        }
        finalRef.current = finalText;
        setInterim(interimText.trim());
      };

      recognition.onnomatch = () => {
        if (!isLive()) return;
        console.error("[practice/mic] error: nomatch");
        // onend usually follows — stay ready without alarming the user.
      };

      recognition.onerror = (event) => {
        if (!isLive()) return;
        const code = event.error ?? "error";
        console.error(`[practice/mic] error: ${code}`);

        if (code === "aborted" || code === "no-speech") {
          // Soft: onend follows and returns UI to ready for another tap.
          return;
        }

        if (code === "not-allowed" || code === "service-not-allowed") {
          setError(
            "Microphone permission is needed. Please allow the mic and try again."
          );
        } else if (code === "audio-capture") {
          setError(
            "Could not reach the microphone. Close other apps using it and try again."
          );
        } else {
          setError("Could not hear you. Please try again.");
        }

        // Clear "listening" UI immediately so the button never looks stuck;
        // onend still runs and finishes teardown for this session.
        listeningRef.current = false;
        setListening(false);
        setInterim("");
      };

      recognition.onend = () => {
        if (!isLive()) return;
        console.log("[practice/mic] ended session", mySession);
        const text = finalRef.current.trim();
        const cb = onFinalRef.current;
        markReady();
        // Only deliver transcript for this live session.
        if (text && cb) {
          onFinalRef.current = null;
          cb(text);
        }
      };

      recogRef.current = recognition;

      const tryStart = (attempt: number) => {
        if (!isLive()) return;
        try {
          recognition.start();
          // Optimistic UI — onstart confirms; onerror/onend clear if start fails.
          listeningRef.current = true;
          setListening(true);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          console.error(
            `[practice/mic] error: already-started-or-failed (attempt ${attempt})`,
            message
          );
          // Classic: .start() while engine still settling — retry once after settle.
          if (attempt < 2) {
            settleTimerRef.current = setTimeout(() => {
              settleTimerRef.current = null;
              tryStart(attempt + 1);
            }, RESTART_SETTLE_MS);
            return;
          }
          setError("Could not start the microphone. Please try again.");
          markReady();
        }
      };

      tryStart(1);
    },
    [markReady]
  );

  const start = useCallback(
    (onFinal: (text: string) => void) => {
      const Ctor = getSpeechRecognitionCtor();
      if (!Ctor) {
        setError("Speech recognition is not available on this browser.");
        return;
      }

      // Guard double-start / restart while active: stop cleanly, then begin fresh.
      if (listeningRef.current || recogRef.current || startQueuedRef.current) {
        if (startQueuedRef.current) {
          // Replace the pending onFinal if a start is already queued.
          onFinalRef.current = onFinal;
          return;
        }
        startQueuedRef.current = true;
        onFinalRef.current = onFinal;
        void tearDownActive("before-restart").then(() => {
          settleTimerRef.current = setTimeout(() => {
            settleTimerRef.current = null;
            startQueuedRef.current = false;
            const cb = onFinalRef.current;
            if (cb) beginSession(cb);
          }, RESTART_SETTLE_MS);
        });
        return;
      }

      beginSession(onFinal);
    },
    [beginSession, tearDownActive]
  );

  useEffect(
    () => () => {
      clearTimers();
      sessionRef.current += 1;
      const r = recogRef.current;
      recogRef.current = null;
      if (r) {
        try {
          r.onend = null;
          r.onerror = null;
          r.abort();
        } catch {
          // ignore
        }
      }
    },
    [clearTimers]
  );

  return {
    supported,
    listening,
    interim,
    error,
    clearError: () => setError(null),
    start,
    stop,
  };
}
