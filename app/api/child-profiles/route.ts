import { NextResponse } from "next/server";
import { z } from "zod";
import { getOptionalUser } from "@/lib/supabase/server";
import { ALLOWED_AGES } from "@/lib/constants";

const ChildProfileSchema = z.object({
  name: z.string().min(1).max(80).transform((s) => s.trim()),
  ageGroup: z.enum(ALLOWED_AGES),
  trait: z.string().max(120).optional().nullable(),
  avatarEmoji: z.string().max(8).optional(),
});

function mapRow(row: {
  id: string;
  name: string;
  age_group: string;
  trait: string | null;
  avatar_emoji: string | null;
  created_at: string;
}) {
  return {
    id: row.id,
    name: row.name,
    ageGroup: row.age_group,
    trait: row.trait,
    avatarEmoji: row.avatar_emoji ?? "🧒",
    createdAt: row.created_at,
  };
}

export async function GET() {
  const { user } = await getOptionalUser();
  if (!user) return NextResponse.json({ profiles: [] }, { status: 200 });

  const supabase = await import("@/lib/supabase/server").then((m) => m.createClient());
  if (!supabase) return NextResponse.json({ profiles: [] }, { status: 200 });

  const { data, error } = await supabase
    .from("child_profiles")
    .select("id, name, age_group, trait, avatar_emoji, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[child-profiles GET]", error);
    return NextResponse.json({ error: "Failed to load profiles" }, { status: 500 });
  }

  return NextResponse.json({ profiles: (data ?? []).map(mapRow) });
}

export async function POST(request: Request) {
  const { user } = await getOptionalUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const body = await request.json();
  const parsed = ChildProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const supabase = await import("@/lib/supabase/server").then((m) => m.createClient());
  if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const { data, error } = await supabase
    .from("child_profiles")
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      age_group: parsed.data.ageGroup,
      trait: parsed.data.trait ?? null,
      avatar_emoji: parsed.data.avatarEmoji ?? "🧒",
    })
    .select("id, name, age_group, trait, avatar_emoji, created_at")
    .single();

  if (error) {
    console.error("[child-profiles POST]", error);
    return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
  }

  return NextResponse.json({ profile: mapRow(data) });
}
