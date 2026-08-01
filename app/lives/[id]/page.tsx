"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Stars } from "@/components/Stars";
import { DecorativeBackground } from "@/components/DecorativeBackground";
import { AppNav } from "@/components/AppNav";
import { StatsHeader } from "@/components/lives/StatsHeader";
import { RelationshipsPanel } from "@/components/lives/RelationshipsPanel";
import { SceneGeneratingStatus } from "@/components/lives/SceneGeneratingStatus";
import { SceneText } from "@/components/lives/SceneText";
import { VocabGlossary } from "@/components/lives/VocabGlossary";
import { PaywallModal } from "@/components/PaywallModal";
import { useTranslation } from "@/lib/useTranslation";
import { parseStats } from "@/lib/lives/deltas";
import {
  normalizeStoredChoices,
  vocabFromDeltasApplied,
} from "@/lib/lives/choices";
import { friendlySceneError } from "@/lib/lives/errors";
import { LIVES_DAILY_LIMIT_MESSAGE } from "@/lib/lives/usage";
import { LivesSpeakButton } from "@/components/lives/LivesSpeakButton";
import { useLivesTTS } from "@/lib/lives/useLivesTTS";
import type {
  LifeChoice,
  LifeRelationship,
  LifeStats,
  VocabPair,
} from "@/lib/lives/types";
import type { Lang } from "@/types";

type PlayState = {
  lifeId: string;
  name: string;
  age: number;
  stats: LifeStats;
  turnCount: number;
  status: string;
  sceneText: string;
  choices: LifeChoice[];
  vocab: VocabPair[];
  beatId: string;
  relationships: LifeRelationship[];
};

export default function LivesPlayPage() {
  const params = useParams();
  const lifeId = typeof params?.id === "string" ? params.id : "";
  const router = useRouter();

  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    const s = localStorage.getItem("teret_lang");
    return s === "am" || s === "en" || s === "es" ? s : "en";
  });
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("teret_lang", l);
    } catch {
      // ignore
    }
  }, []);
  const { t } = useTranslation(lang);
  const tts = useLivesTTS();

  const [authChecking, setAuthChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [play, setPlay] = useState<PlayState | null>(null);
  const [sceneKey, setSceneKey] = useState(0);
  const [turning, setTurning] = useState(false);
  const [chosenIndex, setChosenIndex] = useState<number | null>(null);
  const [turnError, setTurnError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => (r.ok ? r.json() : { stripeEnabled: false }))
      .then((d) => setStripeEnabled(d.stripeEnabled ?? false))
      .catch(() => setStripeEnabled(false));
  }, []);

  const loadLife = useCallback(async (uid: string) => {
    const supabase = createClient();
    if (!supabase || !lifeId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const { data: life, error: lifeError } = await supabase
      .from("lives")
      .select("id, user_id, name, age, stats, turn_count, status")
      .eq("id", lifeId)
      .maybeSingle();

    if (lifeError || !life || life.user_id !== uid) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const [{ data: beat }, { data: rels }] = await Promise.all([
      supabase
        .from("life_beats")
        .select("id, turn_number, scene_text, choices, deltas_applied")
        .eq("life_id", lifeId)
        .order("turn_number", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("life_relationships")
        .select("id, name, role, dimensions")
        .eq("life_id", lifeId),
    ]);

    if (!beat) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setPlay({
      lifeId: life.id,
      name: life.name,
      age: life.age,
      stats: parseStats(life.stats),
      turnCount: life.turn_count,
      status: life.status,
      sceneText: beat.scene_text,
      choices: normalizeStoredChoices(beat.choices),
      vocab: vocabFromDeltasApplied(beat.deltas_applied),
      beatId: beat.id,
      relationships: (rels ?? []).map((r) => ({
        id: r.id,
        name: r.name,
        role: r.role,
        dimensions: parseStats(r.dimensions),
      })),
    });
    setSceneKey((k) => k + 1);
    setLoading(false);
  }, [lifeId]);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      router.replace(
        "/account?signin=1&returnTo=" + encodeURIComponent(`/lives/${lifeId}`)
      );
      return;
    }
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace(
          "/account?signin=1&returnTo=" + encodeURIComponent(`/lives/${lifeId}`)
        );
        return;
      }
      setEmail(user.email ?? null);
      setDisplayName(
        (user.user_metadata?.full_name as string) ??
          (user.user_metadata?.name as string) ??
          null
      );
      setAvatarUrl(
        (user.user_metadata?.avatar_url as string) ??
          (user.user_metadata?.picture as string) ??
          null
      );
      setAuthChecking(false);
      loadLife(user.id);
    });
  }, [router, lifeId, loadLife]);

  const choose = async (index: number) => {
    if (!play || turning || limitReached || play.status !== "active") return;
    tts.stop();
    setTurning(true);
    setChosenIndex(index);
    setTurnError(null);
    try {
      const res = await fetch(`/api/lives/${play.lifeId}/turn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chosen_index: index }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 402 || data.code === "LIVES_DAILY_LIMIT") {
        setTurnError(data.error ?? LIVES_DAILY_LIMIT_MESSAGE);
        setLimitReached(true);
        setShowPaywall(true);
        setTurning(false);
        setChosenIndex(null);
        return;
      }

      if (!res.ok) {
        setTurnError(friendlySceneError(data.error));
        setTurning(false);
        setChosenIndex(null);
        return;
      }

      const nextChoices = normalizeStoredChoices(
        data.choices ?? data.beat?.choices
      );

      setPlay({
        lifeId: play.lifeId,
        name: data.life?.name ?? play.name,
        age: data.life?.age ?? play.age,
        stats: parseStats(data.stats ?? data.life?.stats ?? play.stats),
        turnCount: data.life?.turnCount ?? play.turnCount + 1,
        status: data.life?.status ?? play.status,
        sceneText: (data.scene as string) ?? data.beat?.sceneText ?? "",
        choices: nextChoices,
        vocab: Array.isArray(data.vocab)
          ? data.vocab
          : vocabFromDeltasApplied(data.beat?.deltasApplied),
        beatId: data.beat?.id ?? play.beatId,
        relationships: Array.isArray(data.relationships)
          ? data.relationships.map(
              (r: {
                id?: string;
                name: string;
                role: string | null;
                dimensions: unknown;
              }) => ({
                id: r.id,
                name: r.name,
                role: r.role,
                dimensions: parseStats(r.dimensions),
              })
            )
          : play.relationships,
      });
      setSceneKey((k) => k + 1);
      setTurning(false);
      setChosenIndex(null);
    } catch {
      setTurnError("Could not advance — try again");
      setTurning(false);
      setChosenIndex(null);
    }
  };

  if (authChecking || loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            "linear-gradient(180deg,#0d0d2b 0%,#1a1a4e 25%,#2d1b69 55%,#5a2d00 100%)",
          fontFamily: "'Nunito',sans-serif",
        }}
      >
        <p className="text-[#c9b8e8]">{t.authLoading}</p>
      </div>
    );
  }

  if (notFound || !play) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-5"
        style={{
          background:
            "linear-gradient(180deg,#0d0d2b 0%,#1a1a4e 25%,#2d1b69 55%,#5a2d00 100%)",
          fontFamily: "'Nunito',sans-serif",
        }}
      >
        <p className="text-[#e8e0ff] mb-4 text-center">This life was not found.</p>
        <Link href="/lives" className="text-[#FFD700] font-bold text-sm">
          Back to Lives
        </Link>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg,#0d0d2b 0%,#1a1a4e 25%,#2d1b69 55%,#5a2d00 100%)",
        fontFamily: "'Nunito',sans-serif",
      }}
    >
      <Stars />
      <DecorativeBackground />
      <AppNav
        lang={lang}
        setLang={setLang}
        isSignedIn
        avatarUrl={avatarUrl}
        displayName={displayName}
        email={email}
      />
      <StatsHeader name={play.name} age={play.age} stats={play.stats} />

      <div className="max-w-[640px] mx-auto px-5 pt-4 pb-28 relative z-[1]">
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/lives"
            className="text-[12px] font-bold text-[#c9b8e8] hover:text-[#FFD700]"
          >
            ← Lives
          </Link>
          <span className="text-[11px] text-[rgba(200,180,255,0.5)]">
            Turn {play.turnCount}
          </span>
        </div>

        {turning ? (
          <div className="mb-6">
            <div className="mb-4 pointer-events-none select-none">
              <SceneText text={play.sceneText} maxParagraphs={2} faded />
            </div>
            <SceneGeneratingStatus />
          </div>
        ) : (
          <article
            key={sceneKey}
            className="mb-4"
            style={{ animation: "fadeSlideUp 0.45s ease-out" }}
          >
            <div className="flex items-start gap-2 mb-3">
              <LivesSpeakButton
                clipKey={`scene-${play.beatId}`}
                text={play.sceneText}
                lang="am"
                playingKey={tts.playingKey}
                loadingKey={tts.loadingKey}
                onSpeak={tts.speak}
                label="Listen to scene in Amharic"
              />
              <span className="text-[11px] text-[rgba(200,180,255,0.55)] pt-2.5">
                አዳምጡ · Listen
              </span>
            </div>
            <SceneText text={play.sceneText} />
          </article>
        )}

        {!turning && (
          <VocabGlossary
            vocab={play.vocab}
            playingKey={tts.playingKey}
            loadingKey={tts.loadingKey}
            onSpeak={tts.speak}
          />
        )}

        {tts.error && (
          <p className="text-[#ff6b6b] text-[12px] mb-3" role="alert">
            {tts.error}
          </p>
        )}

        {turnError && !limitReached && (
          <p className="text-[#ff6b6b] text-[13px] mb-4" role="alert">
            {turnError}
          </p>
        )}

        {limitReached && (
          <div
            className="mb-5 rounded-2xl border border-[rgba(255,215,0,0.35)] p-4 text-center"
            style={{ background: "rgba(255,215,0,0.06)" }}
          >
            <p className="text-[#e8e0ff] text-[14px] leading-relaxed mb-3">
              {turnError ?? LIVES_DAILY_LIMIT_MESSAGE}
            </p>
            <button
              type="button"
              onClick={() => setShowPaywall(true)}
              className="min-h-[44px] px-5 rounded-full text-[13px] font-bold text-[#1a0533]"
              style={{
                background: "linear-gradient(135deg, #FFB088, #FFD700)",
              }}
            >
              Go Premium
            </button>
          </div>
        )}

        <div className="space-y-3 mb-8">
          {play.choices.map((choice, index) => {
            const isChosen = turning && chosenIndex === index;
            const isDimmed = turning && chosenIndex !== index;
            const clipKey = `choice-${play.beatId}-${index}`;
            return (
              <div
                key={`${sceneKey}-${index}`}
                className={`flex items-stretch gap-2 rounded-2xl border transition-all ${
                  isChosen
                    ? "border-[#FFD700]"
                    : isDimmed
                      ? "border-[rgba(255,215,0,0.12)] opacity-35"
                      : "border-[rgba(255,215,0,0.22)]"
                }`}
                style={{
                  background: isChosen
                    ? "linear-gradient(135deg, rgba(255,176,136,0.35), rgba(255,215,0,0.25))"
                    : "rgba(255,255,255,0.05)",
                }}
              >
                <div className="flex items-center pl-2">
                  <LivesSpeakButton
                    clipKey={clipKey}
                    text={choice.english}
                    lang="en"
                    playingKey={tts.playingKey}
                    loadingKey={tts.loadingKey}
                    onSpeak={tts.speak}
                    label={`Hear pronunciation: ${choice.english}`}
                    size="sm"
                  />
                </div>
                <button
                  type="button"
                  disabled={turning || limitReached || play.status !== "active"}
                  onClick={() => choose(index)}
                  className={`flex-1 min-h-[64px] text-left px-3 py-3.5 rounded-2xl tap-zone disabled:cursor-not-allowed ${
                    isChosen ? "text-[#1a0533]" : "text-[#e8e0ff]"
                  }`}
                >
                  <span className="block text-[15px] font-bold leading-snug">
                    {choice.english}
                  </span>
                  {choice.amharic && (
                    <span
                      className={`block text-[12px] mt-1 leading-snug ${
                        isChosen
                          ? "text-[rgba(26,5,51,0.75)]"
                          : "text-[rgba(200,180,255,0.65)]"
                      }`}
                      style={{ fontFamily: "var(--font-amharic), sans-serif" }}
                    >
                      {choice.amharic}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <RelationshipsPanel relationships={play.relationships} />
      </div>

      {showPaywall && (
        <PaywallModal
          lang={lang}
          stripeEnabled={stripeEnabled}
          onClose={() => setShowPaywall(false)}
        />
      )}
    </div>
  );
}
