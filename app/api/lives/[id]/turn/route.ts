import { NextResponse } from "next/server";
import { z } from "zod";
import { getOptionalUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { RECENT_BEATS_LIMIT } from "@/lib/lives/constants";
import { parseStats } from "@/lib/lives/deltas";
import {
  generateScene,
  SceneGenerationError,
} from "@/lib/lives/generateScene";
import type {
  LifeChoice,
  LifeRelationship,
  RecentBeat,
} from "@/lib/lives/types";

export const maxDuration = 90;

const TurnBodySchema = z.object({
  chosen_index: z.number().int().min(0),
});

function choiceLabel(choices: unknown, index: number): string | null {
  if (!Array.isArray(choices)) return null;
  const item = choices[index];
  if (!item || typeof item !== "object") return null;
  const label = (item as { label?: unknown }).label;
  return typeof label === "string" && label.trim() ? label.trim() : null;
}

function mapRelationship(row: {
  id: string;
  name: string;
  role: string | null;
  dimensions: unknown;
}): LifeRelationship & { id: string } {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    dimensions: parseStats(row.dimensions),
  };
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await getOptionalUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const { id: lifeId } = await context.params;
    if (!lifeId || !z.string().uuid().safeParse(lifeId).success) {
      return NextResponse.json({ error: "Invalid life id" }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = TurnBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const { data: life, error: lifeError } = await admin
      .from("lives")
      .select(
        "id, user_id, scenario_id, name, age, stats, summary, turn_count, status, created_at, updated_at"
      )
      .eq("id", lifeId)
      .maybeSingle();

    if (lifeError) {
      console.error("[lives/turn] load life:", lifeError);
      return NextResponse.json({ error: "Failed to load life" }, { status: 500 });
    }
    if (!life) {
      return NextResponse.json({ error: "Life not found" }, { status: 404 });
    }
    if (life.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (life.status !== "active") {
      return NextResponse.json({ error: "Life is not active" }, { status: 409 });
    }

    const { data: scenario, error: scenarioError } = await admin
      .from("scenarios")
      .select("id, world_bible")
      .eq("id", life.scenario_id)
      .maybeSingle();

    if (scenarioError || !scenario) {
      console.error("[lives/turn] load scenario:", scenarioError);
      return NextResponse.json({ error: "Scenario not found" }, { status: 500 });
    }

    const { data: recentRows, error: beatsError } = await admin
      .from("life_beats")
      .select("id, turn_number, scene_text, choices, chosen_index, deltas_applied, created_at")
      .eq("life_id", life.id)
      .order("turn_number", { ascending: false })
      .limit(RECENT_BEATS_LIMIT);

    if (beatsError) {
      console.error("[lives/turn] load beats:", beatsError);
      return NextResponse.json({ error: "Failed to load beats" }, { status: 500 });
    }

    const recentDesc = recentRows ?? [];
    const previousBeat = recentDesc[0];
    if (!previousBeat) {
      return NextResponse.json({ error: "No previous scene found" }, { status: 409 });
    }

    const actionLabel = choiceLabel(previousBeat.choices, parsed.data.chosen_index);
    if (!actionLabel) {
      return NextResponse.json({ error: "Invalid chosen_index" }, { status: 400 });
    }

    const { data: relRows, error: relError } = await admin
      .from("life_relationships")
      .select("id, name, role, dimensions")
      .eq("life_id", life.id);

    if (relError) {
      console.error("[lives/turn] load relationships:", relError);
      return NextResponse.json({ error: "Failed to load relationships" }, { status: 500 });
    }

    const relationships = (relRows ?? []).map(mapRelationship);

    const recentBeats: RecentBeat[] = [...recentDesc]
      .reverse()
      .map((b) => ({
        turn_number: b.turn_number,
        scene_text: b.scene_text,
        choice_made:
          b.id === previousBeat.id
            ? null
            : choiceLabel(b.choices, b.chosen_index ?? -1),
      }));

    let scene;
    try {
      scene = await generateScene({
        worldBible: scenario.world_bible,
        playerName: life.name,
        stats: parseStats(life.stats),
        relationships,
        age: life.age,
        turnCount: life.turn_count,
        summary: life.summary ?? "",
        recentBeats,
        playerAction: actionLabel,
      });
    } catch (err) {
      console.error("[lives/turn] scene generation failed:", err);
      const message =
        err instanceof SceneGenerationError
          ? err.message
          : "Failed to generate scene";
      // No DB mutations yet — life stays consistent.
      return NextResponse.json({ error: message }, { status: 502 });
    }

    const nextTurnNumber = life.turn_count + 1;
    const now = new Date().toISOString();

    // Mutations only after generation succeeds. Roll back on failure so a mid-turn
    // error does not leave the life ahead of its beats (or vice versa).
    const rollbackTurn = async (newBeatId?: string) => {
      if (newBeatId) {
        await admin.from("life_beats").delete().eq("id", newBeatId);
      }
      await admin
        .from("life_beats")
        .update({ chosen_index: null })
        .eq("id", previousBeat.id);
      await admin
        .from("lives")
        .update({
          stats: life.stats,
          age: life.age,
          summary: life.summary,
          turn_count: life.turn_count,
          updated_at: life.updated_at,
        })
        .eq("id", life.id);
      for (const rel of relationships) {
        if (!rel.id) continue;
        await admin
          .from("life_relationships")
          .update({ dimensions: rel.dimensions, role: rel.role })
          .eq("id", rel.id);
      }
    };

    const { error: prevBeatError } = await admin
      .from("life_beats")
      .update({ chosen_index: parsed.data.chosen_index })
      .eq("id", previousBeat.id)
      .eq("life_id", life.id);

    if (prevBeatError) {
      console.error("[lives/turn] update previous beat:", prevBeatError);
      return NextResponse.json({ error: "Failed to save choice" }, { status: 500 });
    }

    const { data: newBeat, error: newBeatError } = await admin
      .from("life_beats")
      .insert({
        life_id: life.id,
        turn_number: nextTurnNumber,
        scene_text: scene.narrative,
        choices: scene.choices,
        chosen_index: null,
        deltas_applied: scene.deltasApplied,
      })
      .select("id, turn_number, scene_text, choices, chosen_index, deltas_applied, created_at")
      .single();

    if (newBeatError || !newBeat) {
      console.error("[lives/turn] insert beat:", newBeatError);
      await rollbackTurn();
      return NextResponse.json({ error: "Failed to save scene" }, { status: 500 });
    }

    for (const rel of scene.relationships) {
      const existing = relationships.find(
        (r) => r.name.toLowerCase() === rel.name.toLowerCase()
      );
      if (!existing?.id) continue;
      const { error: updRelError } = await admin
        .from("life_relationships")
        .update({
          dimensions: rel.dimensions,
          role: rel.role,
        })
        .eq("id", existing.id)
        .eq("life_id", life.id);
      if (updRelError) {
        console.error("[lives/turn] update relationship:", updRelError);
        await rollbackTurn(newBeat.id);
        return NextResponse.json(
          { error: "Failed to update relationships" },
          { status: 500 }
        );
      }
    }

    const { data: updatedLife, error: updateLifeError } = await admin
      .from("lives")
      .update({
        stats: scene.stats,
        age: scene.age,
        summary: scene.summaryUpdate,
        turn_count: nextTurnNumber,
        updated_at: now,
      })
      .eq("id", life.id)
      .eq("user_id", user.id)
      .select(
        "id, scenario_id, name, age, stats, summary, turn_count, status, created_at, updated_at"
      )
      .single();

    if (updateLifeError || !updatedLife) {
      console.error("[lives/turn] update life:", updateLifeError);
      await rollbackTurn(newBeat.id);
      return NextResponse.json({ error: "Failed to update life" }, { status: 500 });
    }

    const { data: freshRels } = await admin
      .from("life_relationships")
      .select("id, name, role, dimensions")
      .eq("life_id", life.id);

    return NextResponse.json({
      life: {
        id: updatedLife.id,
        scenarioId: updatedLife.scenario_id,
        name: updatedLife.name,
        age: updatedLife.age,
        stats: parseStats(updatedLife.stats),
        summary: updatedLife.summary,
        turnCount: updatedLife.turn_count,
        status: updatedLife.status,
        createdAt: updatedLife.created_at,
        updatedAt: updatedLife.updated_at,
      },
      relationships: (freshRels ?? []).map(mapRelationship),
      beat: {
        id: newBeat.id,
        turnNumber: newBeat.turn_number,
        sceneText: newBeat.scene_text,
        choices: newBeat.choices as LifeChoice[],
        chosenIndex: newBeat.chosen_index,
        deltasApplied: newBeat.deltas_applied,
        createdAt: newBeat.created_at,
      },
      scene: newBeat.scene_text,
      choices: newBeat.choices as LifeChoice[],
      stats: parseStats(updatedLife.stats),
    });
  } catch (err) {
    console.error("[lives/turn] unexpected:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
