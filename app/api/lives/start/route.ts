import { NextResponse } from "next/server";
import { z } from "zod";
import { getOptionalUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_STARTING_AGE } from "@/lib/lives/constants";
import {
  parseStartingRelationships,
  parseStats,
} from "@/lib/lives/deltas";
import {
  generateScene,
  SceneGenerationError,
} from "@/lib/lives/generateScene";
import type { LifeChoice, LifeRelationship } from "@/lib/lives/types";

export const maxDuration = 90;

const StartBodySchema = z.object({
  scenario_id: z.string().uuid(),
  name: z
    .string()
    .min(1, "Name is required")
    .max(80)
    .transform((s) => s.trim()),
});

function mapRelationship(row: {
  id: string;
  name: string;
  role: string | null;
  dimensions: unknown;
}) {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    dimensions: parseStats(row.dimensions),
  };
}

export async function POST(request: Request) {
  try {
    const { user } = await getOptionalUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = StartBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const { data: scenario, error: scenarioError } = await admin
      .from("scenarios")
      .select(
        "id, slug, title, description, world_bible, starting_stats, starting_relationships, is_published"
      )
      .eq("id", parsed.data.scenario_id)
      .eq("is_published", true)
      .maybeSingle();

    if (scenarioError) {
      console.error("[lives/start] scenario load:", scenarioError);
      return NextResponse.json({ error: "Failed to load scenario" }, { status: 500 });
    }
    if (!scenario) {
      return NextResponse.json({ error: "Scenario not found" }, { status: 404 });
    }

    const startingStats = parseStats(scenario.starting_stats);
    const startingRels = parseStartingRelationships(scenario.starting_relationships);
    const age = DEFAULT_STARTING_AGE;

    let scene;
    try {
      scene = await generateScene({
        worldBible: scenario.world_bible,
        playerName: parsed.data.name,
        stats: startingStats,
        relationships: startingRels,
        age,
        turnCount: 0,
        summary: "",
        recentBeats: [],
        playerAction: "BEGIN",
      });
    } catch (err) {
      console.error("[lives/start] scene generation failed:", err);
      const message =
        err instanceof SceneGenerationError
          ? err.message
          : "Failed to generate opening scene";
      return NextResponse.json({ error: message }, { status: 502 });
    }

    // Persist only after successful generation so a failed AI call leaves no orphan life.
    const { data: life, error: lifeError } = await admin
      .from("lives")
      .insert({
        user_id: user.id,
        scenario_id: scenario.id,
        name: parsed.data.name,
        age: scene.age,
        stats: scene.stats,
        summary: scene.summaryUpdate,
        turn_count: 0,
        status: "active",
      })
      .select(
        "id, user_id, scenario_id, name, age, stats, summary, turn_count, status, created_at, updated_at"
      )
      .single();

    if (lifeError || !life) {
      console.error("[lives/start] insert life:", lifeError);
      return NextResponse.json({ error: "Failed to create life" }, { status: 500 });
    }

    const relRows = scene.relationships.map((r: LifeRelationship) => ({
      life_id: life.id,
      name: r.name,
      role: r.role,
      dimensions: r.dimensions,
    }));

    let relationships: ReturnType<typeof mapRelationship>[] = [];
    if (relRows.length > 0) {
      const { data: insertedRels, error: relError } = await admin
        .from("life_relationships")
        .insert(relRows)
        .select("id, name, role, dimensions");

      if (relError || !insertedRels) {
        console.error("[lives/start] insert relationships:", relError);
        await admin.from("lives").delete().eq("id", life.id);
        return NextResponse.json(
          { error: "Failed to create relationships" },
          { status: 500 }
        );
      }
      relationships = insertedRels.map(mapRelationship);
    }

    const { data: beat, error: beatError } = await admin
      .from("life_beats")
      .insert({
        life_id: life.id,
        turn_number: 0,
        scene_text: scene.narrative,
        choices: scene.choices,
        chosen_index: null,
        deltas_applied: scene.deltasApplied,
      })
      .select("id, turn_number, scene_text, choices, chosen_index, deltas_applied, created_at")
      .single();

    if (beatError || !beat) {
      console.error("[lives/start] insert beat:", beatError);
      await admin.from("lives").delete().eq("id", life.id);
      return NextResponse.json({ error: "Failed to save opening scene" }, { status: 500 });
    }

    return NextResponse.json({
      life: {
        id: life.id,
        scenarioId: life.scenario_id,
        name: life.name,
        age: life.age,
        stats: parseStats(life.stats),
        summary: life.summary,
        turnCount: life.turn_count,
        status: life.status,
        createdAt: life.created_at,
        updatedAt: life.updated_at,
      },
      scenario: {
        id: scenario.id,
        slug: scenario.slug,
        title: scenario.title,
        description: scenario.description,
      },
      relationships,
      beat: {
        id: beat.id,
        turnNumber: beat.turn_number,
        sceneText: beat.scene_text,
        choices: beat.choices as LifeChoice[],
        chosenIndex: beat.chosen_index,
        deltasApplied: beat.deltas_applied,
        createdAt: beat.created_at,
      },
      // Convenience aliases for the client play loop
      scene: beat.scene_text,
      choices: beat.choices as LifeChoice[],
      stats: parseStats(life.stats),
    });
  } catch (err) {
    console.error("[lives/start] unexpected:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
