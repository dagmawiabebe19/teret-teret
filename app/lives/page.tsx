"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Stars } from "@/components/Stars";
import { DecorativeBackground } from "@/components/DecorativeBackground";
import { AppNav } from "@/components/AppNav";
import { NamePromptModal } from "@/components/lives/NamePromptModal";
import { useTranslation } from "@/lib/useTranslation";
import { parseStats } from "@/lib/lives/deltas";
import { friendlySceneError } from "@/lib/lives/errors";
import type { Lang } from "@/types";

type ScenarioRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
};

type ActiveLife = {
  id: string;
  name: string;
  age: number;
  stats: Record<string, number>;
  turnCount: number;
  scenarioTitle: string;
};

export default function LivesHomePage() {
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

  const [authChecking, setAuthChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [activeLives, setActiveLives] = useState<ActiveLife[]>([]);
  const [scenarios, setScenarios] = useState<ScenarioRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [pendingScenario, setPendingScenario] = useState<ScenarioRow | null>(null);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const supabase = createClient();
    if (!supabase) {
      setLoadError("Database not configured");
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError(null);

    const [livesRes, scenariosRes] = await Promise.all([
      supabase
        .from("lives")
        .select("id, name, age, stats, turn_count, updated_at, scenarios(title)")
        .eq("status", "active")
        .order("updated_at", { ascending: false }),
      supabase
        .from("scenarios")
        .select("id, slug, title, description")
        .eq("is_published", true)
        .order("title", { ascending: true }),
    ]);

    if (livesRes.error || scenariosRes.error) {
      console.error("[lives home]", livesRes.error || scenariosRes.error);
      setLoadError("Could not load Lives. Make sure the Lives migration is applied.");
      setLoading(false);
      return;
    }

    const lives: ActiveLife[] = (livesRes.data ?? []).map((row) => {
      const scenarioJoin = row.scenarios as
        | { title: string }
        | { title: string }[]
        | null;
      const scenarioTitle = Array.isArray(scenarioJoin)
        ? scenarioJoin[0]?.title
        : scenarioJoin?.title;
      return {
        id: row.id as string,
        name: row.name as string,
        age: row.age as number,
        stats: parseStats(row.stats),
        turnCount: row.turn_count as number,
        scenarioTitle: scenarioTitle ?? "Life",
      };
    });

    setActiveLives(lives);
    setScenarios((scenariosRes.data ?? []) as ScenarioRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      router.replace("/account?signin=1&returnTo=" + encodeURIComponent("/lives"));
      return;
    }
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace("/account?signin=1&returnTo=" + encodeURIComponent("/lives"));
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
      loadData();
    });
  }, [router, loadData]);

  const handleStart = async (name: string) => {
    if (!pendingScenario) return;
    setStarting(true);
    setStartError(null);
    try {
      const res = await fetch("/api/lives/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario_id: pendingScenario.id,
          name,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStartError(friendlySceneError(data.error));
        setStarting(false);
        return;
      }
      const lifeId = data.life?.id as string | undefined;
      if (!lifeId) {
        setStartError("Started, but missing life id");
        setStarting(false);
        return;
      }
      router.push(`/lives/${lifeId}`);
    } catch {
      setStartError("Could not start life");
      setStarting(false);
    }
  };

  if (authChecking) {
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

      <div className="max-w-[640px] mx-auto px-5 pt-16 pb-24 relative z-[1]">
        <Link
          href="/"
          className="inline-block mb-4 text-[12px] font-bold text-[#c9b8e8] hover:text-[#FFD700]"
        >
          ← Bedtime Stories
        </Link>
        <h1 className="font-fredoka text-[28px] text-[#FFD700] mb-1">Lives</h1>
        <p className="text-[13px] text-[rgba(200,180,255,0.65)] mb-6">
          An interactive life simulation — your choices shape the story.
        </p>

        {loading ? (
          <p className="text-[#c9b8e8] text-center py-12">{t.authLoading}</p>
        ) : loadError ? (
          <p className="text-[#ff6b6b] text-center py-8 text-sm">{loadError}</p>
        ) : (
          <>
            {activeLives.length > 0 && (
              <section className="mb-8">
                <h2 className="text-[12px] font-bold uppercase tracking-wide text-[rgba(200,180,255,0.55)] mb-3">
                  Continue Your Life
                </h2>
                <div className="space-y-3">
                  {activeLives.map((life) => {
                    const money = life.stats.money ?? 0;
                    return (
                      <div
                        key={life.id}
                        className="rounded-2xl border border-[rgba(255,215,0,0.25)] p-4 sm:p-5"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
                        }}
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <p className="font-fredoka text-[#FFD700] text-[18px] leading-tight">
                              {life.name}
                            </p>
                            <p className="text-[12px] text-[#c9b8e8] mt-0.5">
                              Age {life.age} · {life.scenarioTitle}
                            </p>
                          </div>
                          <span className="text-[11px] text-[rgba(200,180,255,0.5)] shrink-0">
                            Turn {life.turnCount}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-[12px] font-bold text-[#e8e0ff] mb-4">
                          <span>💰 {Math.round(money)}</span>
                          <span>❤️ {Math.round(life.stats.health ?? 0)}</span>
                          <span>😊 {Math.round(life.stats.happiness ?? 0)}</span>
                          <span>⭐ {Math.round(life.stats.reputation ?? 0)}</span>
                        </div>
                        <Link
                          href={`/lives/${life.id}`}
                          className="flex items-center justify-center w-full min-h-[52px] rounded-full text-[15px] font-bold text-[#1a0533] no-underline transition-transform active:scale-[0.98]"
                          style={{
                            background: "linear-gradient(135deg, #FFB088, #FFD700)",
                            boxShadow: "0 2px 12px rgba(255,140,0,0.25)",
                          }}
                        >
                          Continue
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-[12px] font-bold uppercase tracking-wide text-[rgba(200,180,255,0.55)] mb-3">
                Start a New Life
              </h2>
              {scenarios.length === 0 ? (
                <p className="text-[#c9b8e8] text-sm py-6">
                  No scenarios published yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {scenarios.map((scenario) => (
                    <div
                      key={scenario.id}
                      className="rounded-2xl border border-[rgba(255,215,0,0.12)] p-4 sm:p-5 bg-[rgba(255,255,255,0.04)]"
                    >
                      <p className="font-fredoka text-[#FFD700] text-[17px] mb-1">
                        {scenario.title}
                      </p>
                      {scenario.description && (
                        <p className="text-[13px] text-[#c9b8e8] leading-relaxed mb-4">
                          {scenario.description}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setStartError(null);
                          setPendingScenario(scenario);
                        }}
                        className="w-full min-h-[48px] rounded-full text-[14px] font-bold text-[#FFD700] border border-[rgba(255,215,0,0.35)] hover:bg-[rgba(255,215,0,0.08)] transition-colors"
                      >
                        Start
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {pendingScenario && (
        <NamePromptModal
          scenarioTitle={pendingScenario.title}
          loading={starting}
          error={startError}
          onCancel={() => {
            if (starting) return;
            setPendingScenario(null);
            setStartError(null);
          }}
          onConfirm={handleStart}
        />
      )}
    </div>
  );
}
