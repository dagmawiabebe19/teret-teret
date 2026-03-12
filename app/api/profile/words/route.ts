import { NextResponse } from "next/server";
import { getOptionalUser } from "@/lib/supabase/server";
import type { VocabWord } from "@/types";

export const dynamic = "force-dynamic";

function parseVocabWord(body: unknown): VocabWord | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  const word = typeof o.word === "string" ? o.word.trim() : "";
  const translation_am = typeof o.translation_am === "string" ? o.translation_am.trim() : "";
  const translation_es = typeof o.translation_es === "string" ? o.translation_es.trim() : "";
  const exampleSentence = typeof o.exampleSentence === "string" ? o.exampleSentence.trim() : "";
  if (!word) return null;
  return { word, translation_am, translation_es, exampleSentence };
}

/** GET — return saved words for the authenticated user */
export async function GET() {
  const { user } = await getOptionalUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = await import("@/lib/supabase/server").then((m) => m.createClient());
  if (!supabase) {
    return NextResponse.json({ words: [] });
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("saved_words")
    .eq("id", user.id)
    .single();

  const words = (profile?.saved_words as VocabWord[] | null) ?? [];
  return NextResponse.json({ words: Array.isArray(words) ? words : [] });
}

/** POST — add a word to saved words */
export async function POST(request: Request) {
  const { user } = await getOptionalUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const vocab = parseVocabWord(body);
  if (!vocab) {
    return NextResponse.json({ error: "Invalid word" }, { status: 400 });
  }

  const supabase = await import("@/lib/supabase/server").then((m) => m.createClient());
  if (!supabase) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("saved_words")
    .eq("id", user.id)
    .single();

  const current = (profile?.saved_words as VocabWord[] | null) ?? [];
  const list = Array.isArray(current) ? current : [];
  const key = vocab.word.toLowerCase();
  if (list.some((w) => w.word.toLowerCase() === key)) {
    return NextResponse.json({ words: list });
  }
  const updated = [...list, vocab];

  await supabase.from("profiles").update({ saved_words: updated }).eq("id", user.id);
  return NextResponse.json({ words: updated });
}

/** DELETE — remove a word from saved words (body: { word: string }) */
export async function DELETE(request: Request) {
  const { user } = await getOptionalUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const word = typeof (body as { word?: string }).word === "string"
    ? (body as { word: string }).word.trim()
    : "";
  if (!word) {
    return NextResponse.json({ error: "Missing word" }, { status: 400 });
  }

  const supabase = await import("@/lib/supabase/server").then((m) => m.createClient());
  if (!supabase) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("saved_words")
    .eq("id", user.id)
    .single();

  const current = (profile?.saved_words as VocabWord[] | null) ?? [];
  const list = Array.isArray(current) ? current : [];
  const updated = list.filter((w) => w.word.toLowerCase() !== word.toLowerCase());

  await supabase.from("profiles").update({ saved_words: updated }).eq("id", user.id);
  return NextResponse.json({ words: updated });
}
