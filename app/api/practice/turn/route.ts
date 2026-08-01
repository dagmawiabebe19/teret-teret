import { NextResponse } from "next/server";
import { z } from "zod";
import { getOptionalUser } from "@/lib/supabase/server";
import { getPracticeScenario } from "@/lib/practice/scenarios";
import {
  generatePracticeTurn,
  PracticeTurnError,
} from "@/lib/practice/generateTurn";

export const maxDuration = 60;

const BodySchema = z.object({
  scenario: z.string().min(1),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "partner"]),
        text: z.string().min(1).max(2000),
      })
    )
    .min(1)
    .max(40),
});

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

    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const scenario = getPracticeScenario(parsed.data.scenario);
    if (!scenario) {
      return NextResponse.json({ error: "Unknown scenario" }, { status: 404 });
    }

    const result = await generatePracticeTurn(scenario, parsed.data.history);
    return NextResponse.json({
      reply: result.reply,
      corrections: result.corrections,
    });
  } catch (err) {
    console.error("[practice/turn]", err);
    const message =
      err instanceof PracticeTurnError
        ? err.message
        : "Something went wrong. Please try again.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
