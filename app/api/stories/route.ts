import { NextResponse } from "next/server";
import { getOptionalUser } from "@/lib/supabase/server";
import { z } from "zod";

const SaveStorySchema = z.object({
  childName: z.string().min(1).max(80),
  region: z.string().max(120),
  ageGroup: z.string().max(20),
  trait: z.string().optional(),
  rawStory: z.string(),
  parsedPages: z.array(z.object({ am: z.string(), en: z.string(), es: z.string() })).optional(),
  languageDefault: z.enum(["am", "en", "es"]).optional(),
  illustrationPrompts: z.array(z.string()).optional(),
});

export async function GET() {
  const { user } = await getOptionalUser();
  if (!user) {
    return NextResponse.json({ stories: [] }, { status: 200 });
  }
  const supabase = await import("@/lib/supabase/server").then((m) => m.createClient());
  if (!supabase) return NextResponse.json({ stories: [] }, { status: 200 });
  const { data, error } = await supabase
    .from("stories")
    .select("id, child_name, region, age_group, trait, raw_story, parsed_pages, language_default, illustration_prompts, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    console.error("[stories GET]", error);
    return NextResponse.json({ error: "Failed to load stories" }, { status: 500 });
  }
  const stories = (data ?? []).map((s: { id: string; child_name: string; region: string; age_group: string; trait: string | null; raw_story: string; parsed_pages: unknown; language_default: string | null; illustration_prompts: string[] | null; created_at: string }) => ({
    id: s.id,
    childName: s.child_name,
    region: s.region,
    ageGroup: s.age_group,
    trait: s.trait,
    rawStory: s.raw_story,
    parsedPages: s.parsed_pages,
    languageDefault: s.language_default,
    illustrationPrompts: s.illustration_prompts ?? undefined,
    createdAt: s.created_at,
  }));
  return NextResponse.json({ stories });
}

export async function POST(request: Request) {
  const { user } = await getOptionalUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to save stories" }, { status: 401 });
  }
  const body = await request.json();
  const parsed = SaveStorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const supabase = await import("@/lib/supabase/server").then((m) => m.createClient());
  if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const { data, error } = await supabase
    .from("stories")
    .insert({
      user_id: user.id,
      child_name: parsed.data.childName,
      region: parsed.data.region,
      age_group: parsed.data.ageGroup,
      trait: parsed.data.trait ?? null,
      raw_story: parsed.data.rawStory,
      parsed_pages: parsed.data.parsedPages ?? null,
      language_default: parsed.data.languageDefault ?? "en",
      illustration_prompts: parsed.data.illustrationPrompts ?? null,
    })
    .select("id, created_at")
    .single();
  if (error) {
    console.error("[stories POST]", error);
    return NextResponse.json({ error: "Failed to save story" }, { status: 500 });
  }
  return NextResponse.json({ id: data.id, createdAt: data.created_at });
}
