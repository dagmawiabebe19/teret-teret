import { NextResponse } from "next/server";
import { z } from "zod";
import { getOptionalUser } from "@/lib/supabase/server";
import { ALLOWED_AGES } from "@/lib/constants";

const UpdateSchema = z.object({
  name: z.string().min(1).max(80).transform((s) => s.trim()).optional(),
  ageGroup: z.enum(ALLOWED_AGES).optional(),
  trait: z.string().max(120).optional().nullable(),
  avatarEmoji: z.string().max(8).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user } = await getOptionalUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const updates: Record<string, string | null> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.ageGroup !== undefined) updates.age_group = parsed.data.ageGroup;
  if (parsed.data.trait !== undefined) updates.trait = parsed.data.trait;
  if (parsed.data.avatarEmoji !== undefined) updates.avatar_emoji = parsed.data.avatarEmoji;

  const supabase = await import("@/lib/supabase/server").then((m) => m.createClient());
  if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const { data, error } = await supabase
    .from("child_profiles")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id, name, age_group, trait, avatar_emoji, created_at")
    .single();

  if (error) {
    console.error("[child-profiles PATCH]", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }

  return NextResponse.json({
    profile: {
      id: data.id,
      name: data.name,
      ageGroup: data.age_group,
      trait: data.trait,
      avatarEmoji: data.avatar_emoji ?? "🧒",
      createdAt: data.created_at,
    },
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user } = await getOptionalUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await import("@/lib/supabase/server").then((m) => m.createClient());
  if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const { error } = await supabase.from("child_profiles").delete().eq("id", id).eq("user_id", user.id);
  if (error) {
    console.error("[child-profiles DELETE]", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
