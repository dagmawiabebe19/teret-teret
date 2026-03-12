import { NextResponse } from "next/server";
import { z } from "zod";
import { AGES, REGIONS, TRAITS_EN, ALLOWED_AGES, ALLOWED_REGIONS, ALLOWED_STORY_INSPIRATIONS, ALLOWED_STORY_CATEGORIES, ALLOWED_STORY_GOALS, CATEGORY_TO_INSPIRATION } from "@/lib/constants";
import {
  FREE_STORIES_PER_DAY,
  getSignedInUsageFromRow,
  checkGuestDailyLimit,
  incrementGuestDaily,
  getClientIp,
} from "@/lib/usageDaily";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseStory, parsedToPages } from "@/lib/parseStory";
import { getVocabForStory } from "@/lib/vocabulary";
import { getOptionalUser } from "@/lib/supabase/server";
import {
  buildLocalIllustrationPrompts,
  buildIllustrationSystemPrompt,
  buildIllustrationUserPrompt,
  parseIllustrationPrompts,
} from "@/lib/illustrationPrompts";
import { checkRateLimit } from "@/lib/rateLimit";
import type { StoryInspiration } from "@/types";
import type { StoryCategory } from "@/types";

/** Set to "true" or "1" to use AI for illustration prompts (extra Anthropic call). Default: local/deterministic. */
const AI_ILLUSTRATION_PROMPTS =
  process.env.AI_ILLUSTRATION_PROMPTS === "true" ||
  process.env.AI_ILLUSTRATION_PROMPTS === "1";

const GenerateStorySchema = z.object({
  childName: z
    .string()
    .min(1, "Child name is required")
    .max(80)
    .transform((s) => s.trim().replace(/[<>\"'&]/g, "")),
  ageGroup: z.enum(ALLOWED_AGES),
  trait: z
    .string()
    .optional()
    .refine((v) => !v || TRAITS_EN.includes(v), "Invalid trait"),
  region: z
    .string()
    .optional()
    .refine((v) => !v || (ALLOWED_REGIONS as readonly string[]).includes(v), "Invalid region"),
  storyInspiration: z.enum(ALLOWED_STORY_INSPIRATIONS).optional(),
  category: z.enum(ALLOWED_STORY_CATEGORIES).optional(),
  topic: z.string().max(120).optional().transform((s) => s?.trim() || undefined),
  storyGoal: z.enum(ALLOWED_STORY_GOALS).optional(),
  language: z.enum(["am", "en", "es"]).optional().default("en"),
});

const ANTHROPIC_TIMEOUT_MS = 60_000;
const MIN_PAGES = 2;

/** Anthropic Messages API: https://api.anthropic.com/v1/messages */
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const ANTHROPIC_MODEL = "claude-3-5-sonnet-20241022";
const ANTHROPIC_MAX_TOKENS = 1500;

/** Call Anthropic Messages API via fetch. Returns combined text from response content blocks. */
async function anthropicMessages(
  systemPrompt: string,
  userContent: string,
  options: { maxTokens?: number; signal?: AbortSignal; messages?: { role: "user" | "assistant"; content: string }[] } = {}
): Promise<{ text: string; raw?: unknown }> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  const messages = options.messages ?? [{ role: "user" as const, content: userContent }];
  const body = {
    model: ANTHROPIC_MODEL,
    max_tokens: options.maxTokens ?? ANTHROPIC_MAX_TOKENS,
    system: systemPrompt,
    messages,
  };
  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
    signal: options.signal,
  });
  const raw = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errMsg = (raw as { error?: { message?: string } })?.error?.message ?? res.statusText;
    const err = new Error(errMsg) as Error & { status?: number; body?: unknown };
    err.status = res.status;
    err.body = raw;
    throw err;
  }
  const content = (raw as { content?: { type: string; text?: string }[] })?.content;
  if (!Array.isArray(content)) {
    console.error("[generate-story] Anthropic response missing content", { hasContent: !!content, keys: raw && typeof raw === "object" ? Object.keys(raw) : [] });
    return { text: "", raw };
  }
  const text = content
    .filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("");
  return { text, raw };
}

const LEARNING_STORY_SYSTEM_PROMPT = `
=== INTRO ===
You are Aya — a storyteller who helps children learn through stories. Write a SHORT story that teaches and delights. The story must feel like a real story first (engaging, imaginative, emotionally resonant), with learning woven naturally inside it.

=== LENGTH & STRUCTURE — CRITICAL ===
• Exactly 4–6 pages total. No more.
• Each page = 2–3 short sentences only.
• Keep total output under 600 tokens.
• Use short sentences. Avoid long paragraphs.
• Use simple vocabulary. Avoid complex or rare words.
• Be concise. Never sound like a textbook or worksheet.

=== CONTENT RATING ===
G — STRICTLY ALL AGES.
No violence, death, scary content, romance, or cruel villains. All conflicts resolve through kindness. Warm, comforting endings only.

=== CATEGORY & LEARNING FOCUS ===
{categoryBlock}

=== TONE ===
Warm, gentle, story-first. The child should feel they are in a story, not in a lesson. Use Ethiopian cultural elements when relevant: names, injera, shiro, jebena, netela, gabi, eucalyptus trees, highland mist, Ethiopian animals (hyena, lion, fox, gelada baboon, ibis).

=== AGE GROUP ===
{ageObj.detail}

=== OUTPUT FORMAT — CRITICAL ===
Output ONLY clean text. NO markdown, NO headers, NO dashes, NO asterisks.
Format EXACTLY like this for EVERY page:

[AM] Amharic text for this page.
[EN] English translation for this page.
[ES] Spanish translation for this page.

Each page = one [AM], one [EN], one [ES]. Every paragraph group MUST have all three. No other text anywhere.

=== STORY STRUCTURE (4–6 pages) ===
1. Page 1: Open [AM] with "ተረት ተረት...". Set the scene briefly.
2. Page 2–3: Child hero (exact name) meets a gentle challenge or discovery.
3. Page 4–5: Kindness, understanding, or friendship wins. Warm moment.
4. Final page: End [AM] with "ተረቱ ሄደ ዘንቢሉ መጣ". Short takeaway if appropriate.

=== RULES ===
NEVER use markdown. ONLY [AM]/[EN]/[ES] blocks. The output must feel like a story, not a lesson plan.
`.trim();

function getCategoryBlock(category: StoryCategory): string {
  switch (category) {
    case "bedtime":
      return `CATEGORY — BEDTIME:
Generate a calm, cozy bedtime story. Emotionally warm, soothing pacing, gentle conflict only. The child should feel safe and ready to sleep. Include a positive moral or comfort. Ethiopian folklore and highland settings welcome.`;
    case "math":
      return `CATEGORY — MATH (learn through story):
Teach a specific math concept (e.g. counting, addition, multiplication, shapes) through narrative. The concept must appear naturally in the story — characters discover or use it in a real situation. Age-appropriate. Do NOT make it feel like a textbook; the story drives, the math is embedded.`;
    case "science":
      return `CATEGORY — SCIENCE (learn through story):
Explain a science concept through curiosity, discovery, and cause-and-effect in the story. Keep it scientifically correct but child-friendly. Examples: gravity, planets, plants, animals, weather, body, seasons. The child or characters discover something; the story makes the concept memorable.`;
    case "history":
      return `CATEGORY — HISTORY (learn through narrative):
Teach a historical event or figure through story. Keep facts broadly accurate but simplify for children. Make it engaging — real people, real places, real courage or wisdom. Examples: Battle of Adwa, ancient civilizations, inventors, explorers. Not dry; the story brings history to life.`;
    case "faith":
      return `CATEGORY — FAITH / MORAL:
Generate a respectful, gentle, child-friendly story that conveys a faith-based or moral lesson (e.g. courage, kindness, forgiveness, honesty, helping others). You may be inspired by Bible stories or universal values. Do NOT quote scripture directly; create an original story that teaches the value. Avoid preachy tone; the story and characters show the lesson.`;
    case "language_learning":
      return `CATEGORY — LANGUAGE LEARNING:
Optimize for vocabulary exposure and comprehension. Use clear, relatable situations. Simple repetitive phrasing where it helps. The story can support dual-language or parallel-language learning (Amharic/English/Spanish). New words should appear in context so meaning is clear from the story.`;
    case "culture_values":
      return `CATEGORY — CULTURE & VALUES:
Focus on tradition, identity, proverbs, kindness, courage, sharing, honesty, respect. Can be Ethiopian-rooted (highlands, family, community) or universal. The story teaches values through what characters do and feel, not through lectures. Warm and culturally rich.`;
    default:
      return getCategoryBlock("bedtime");
  }
}

function getInspirationBlock(storyInspiration: string): string {
  switch (storyInspiration) {
    case "ethiopian_folklore":
      return getCategoryBlock("bedtime");
    case "bible_moral":
      return getCategoryBlock("faith");
    case "animal_adventure":
      return `STORY INSPIRATION — ANIMAL ADVENTURE:
Generate an animal adventure story where animals are the main characters. They go on a gentle adventure and learn a positive life lesson. Keep the child as a friend or observer if needed, but the animals drive the story.`;
    case "friendship_story":
      return getCategoryBlock("culture_values");
    default:
      return getCategoryBlock("bedtime");
  }
}

function buildSystemPrompt(age: string, category: StoryCategory): string {
  const ageObj = AGES.find((a) => a.value === age) || AGES[1];
  const categoryBlock = getCategoryBlock(category);
  return LEARNING_STORY_SYSTEM_PROMPT.replace("{categoryBlock}", categoryBlock).replace(
    "{ageObj.detail}",
    ageObj.detail
  );
}

function buildUserPrompt(
  childName: string,
  trait: string | undefined,
  region: string | undefined,
  category: StoryCategory,
  topic?: string,
  storyGoal?: string
): string {
  const regionObj = region ? REGIONS.find((r) => r.name === region) : null;
  const setting = regionObj ? regionObj.detail : "the beautiful Ethiopian highlands";
  const traitPhrase = trait && TRAITS_EN.includes(trait) ? trait : "is kind and brave";
  let out = `Write a short story (4–6 pages, 2–3 sentences per page) for a child named ${childName} who ${traitPhrase}. Set the story in ${setting}. Make ${childName} the clear hero.`;
  if (topic?.trim()) {
    out += ` The story should teach or explore: ${topic.trim()}.`;
  }
  if (storyGoal === "teach_concept") out += " Focus on explaining one clear concept through the narrative.";
  if (storyGoal === "teach_moral") out += " Focus on a moral lesson (e.g. honesty, courage, sharing) shown through the story.";
  if (storyGoal === "teach_vocabulary") out += " Weave in useful vocabulary naturally; the story should support language learning.";
  if (storyGoal === "teach_history") out += " Teach a historical event or figure through an engaging narrative.";
  if (storyGoal === "teach_faith_value") out += " Convey a faith or value lesson gently through the story.";
  out += " Keep it brief and story-first.";
  return out;
}

const INSPIRATION_TO_CATEGORY: Record<(typeof ALLOWED_STORY_INSPIRATIONS)[number], StoryCategory> = {
  ethiopian_folklore: "bedtime",
  bible_moral: "faith",
  animal_adventure: "culture_values",
  friendship_story: "culture_values",
};

function generateFallbackStory(childName: string, setting: string): string {
  const safeName = childName.slice(0, 40).trim() || "little one";
  return `[AM] ተረት ተረት! ${safeName} በውብ የኢትዮጵያ ደጋ ነበረ። ፀሐይ ብሩህ ነበረች።
[EN] Teret teret! ${safeName} was in ${setting}. The sun was bright.
[ES] ¡Teret teret! ${safeName} estaba en ${setting}. El sol brillaba.

[AM] ${safeName} አንድ ወዳጅ እንስሳ አገኘች። ወዳጅነት እጅግ ጠቃሚ ነው።
[EN] ${safeName} met a friendly animal. Friendship is very important.
[ES] ${safeName} conoció un animal amigable. La amistad es muy importante.

[AM] ${safeName} በጎ ነገር አደረገች። ሁሉም ደስ አላቸው።
[EN] ${safeName} did a kind thing. Everyone was happy.
[ES] ${safeName} hizo algo bueno. Todos estaban contentos.

[AM] ተረቱ ሄደ ዘንቢሉ መጣ። ${safeName} ጣፋጭ ህልም ይስማት።
[EN] The story went, the basket came. May ${safeName} have sweet dreams.
[ES] El cuento se fue, la cesta llegó. Que ${safeName} tenga dulces sueños.`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = GenerateStorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { childName, ageGroup, trait, region, storyInspiration, category: bodyCategory, topic, storyGoal } = parsed.data;
    const category: StoryCategory = bodyCategory ?? INSPIRATION_TO_CATEGORY[storyInspiration ?? "ethiopian_folklore"];
    const storyInspirationForIllustration = CATEGORY_TO_INSPIRATION[category];

    const { user } = await getOptionalUser();

    // Signed-in: rolling 24h free limit (usage_tracking); premium = unlimited
    if (user) {
      const supabase = await import("@/lib/supabase/server").then((m) => m.createClient());
      if (supabase) {
        await supabase.from("usage_tracking").upsert(
          { user_id: user.id, generation_count: 0 },
          { onConflict: "user_id", ignoreDuplicates: true }
        );
        const { data: profile } = await supabase.from("profiles").select("subscription_status").eq("id", user.id).single();
        const isPremium = profile?.subscription_status === "premium" || profile?.subscription_status === "active";
        if (!isPremium) {
          const { data: usage } = await supabase.from("usage_tracking").select("generation_count, first_story_at").eq("user_id", user.id).single();
          const { storiesUsed, remaining } = getSignedInUsageFromRow(usage ?? null);
          if (remaining <= 0) {
            console.log("[teret] rolling daily limit reached", { userId: user.id, storiesUsed, limit: FREE_STORIES_PER_DAY });
            return NextResponse.json(
              { error: "Free story limit reached. Your allowance resets 24 hours after your first story in this period. Upgrade for unlimited." },
              { status: 402 }
            );
          }
          console.log("[teret] usage check ok", { userId: user.id, storiesUsed, remaining, limit: FREE_STORIES_PER_DAY });
        }
      }
    }

    // Guest: daily free limit by IP (rate_limits.guest_daily:*)
    if (!user) {
      const admin = createAdminClient();
      const ip = getClientIp(request);
      const { allowed, storiesUsedToday } = await checkGuestDailyLimit(admin, ip);
      if (!allowed) {
        console.log("[teret] guest daily limit reached", { ip: ip.slice(0, 8), storiesUsedToday, limit: FREE_STORIES_PER_DAY });
        return NextResponse.json(
          { error: "Free daily limit reached. Sign in to get a fresh daily allowance, or upgrade for unlimited." },
          { status: 402 }
        );
      }
    }

    const { allowed: rateLimitOk, ip: clientIp } = await checkRateLimit(request, !user);
    if (!rateLimitOk) {
      console.log("[teret] rate limit exceeded", { ip: clientIp, isGuest: !user });
      return NextResponse.json(
        { error: "Too many stories generated. Please try again later." },
        { status: 429 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
    const keyExists = Boolean(apiKey);
    console.log("[generate-story] ANTHROPIC_API_KEY check:", {
      exists: keyExists,
      length: keyExists ? apiKey!.length : 0,
    });
    if (!apiKey) {
      console.error("[generate-story] ANTHROPIC_API_KEY is missing or empty");
      return NextResponse.json(
        { error: "Story service is not configured" },
        { status: 503 }
      );
    }

    const systemPrompt = buildSystemPrompt(ageGroup, category);
    const userPrompt = buildUserPrompt(childName, trait, region, category, topic, storyGoal);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ANTHROPIC_TIMEOUT_MS);

    let rawText: string;
    try {
      const result = await anthropicMessages(systemPrompt, userPrompt, {
        maxTokens: 700,
        signal: controller.signal,
      });
      rawText = result.text;
    } catch (anthropicErr: unknown) {
      clearTimeout(timeout);
      const err = anthropicErr as { name?: string; status?: number; message?: string; error?: { type?: string; message?: string }; body?: unknown };
      const status = err?.status ?? (err?.error as { status?: number } | undefined)?.status;
      const message = err?.message ?? (err?.error as { message?: string } | undefined)?.message ?? String(anthropicErr);
      const useFallback =
        (status == null ||
          [402, 429, 502, 503, 504].includes(status as number)) &&
        ![400, 401, 403].includes(status as number);
      let fallbackTriggered = false;
      console.error("[generate-story] Anthropic request failed:", {
        name: err?.name ?? "Error",
        status: status ?? "unknown",
        message,
        errorType: (err?.error as { type?: string } | undefined)?.type,
        hasBody: Boolean(err?.body),
      });
      if (err?.body && typeof err.body === "object" && "error" in err.body) {
        const bodyErr = (err.body as { error?: { type?: string; message?: string } }).error;
        if (bodyErr) console.error("[generate-story] API error body:", { type: bodyErr.type, message: bodyErr.message });
      }
      if (useFallback && !fallbackTriggered) {
        fallbackTriggered = true;
        const regionObj = region ? REGIONS.find((r) => r.name === region) : null;
        const setting = regionObj ? regionObj.detail : "the beautiful Ethiopian highlands";
        const rawText = generateFallbackStory(childName, setting);
        const result = parseStory(rawText);
        if (result && result.am.length >= MIN_PAGES) {
          console.log("[teret] fallback story used", { reason: status ?? "network" });
          const pageContents = result.en.length ? result.en : result.am;
          const illustrationPrompts = buildLocalIllustrationPrompts(
            pageContents,
            storyInspirationForIllustration as StoryInspiration,
            regionObj?.name ?? undefined
          );
          result.illustrationPrompts = illustrationPrompts;
          const fallbackPages = parsedToPages(result);
          result.vocabulary = getVocabForStory(fallbackPages, "en").slice(0, 8);
          if (user) {
            const supabase = await import("@/lib/supabase/server").then((m) => m.createClient());
            if (supabase) {
              const { error: rpcError } = await supabase.rpc("increment_usage", { p_user_id: user.id });
              if (rpcError) {
                const now = new Date();
                const { data: usage } = await supabase.from("usage_tracking").select("generation_count, first_story_at").eq("user_id", user.id).single();
                const { windowExpired } = getSignedInUsageFromRow(usage ?? null, now);
                if (windowExpired) {
                  await supabase.from("usage_tracking").update({
                    first_story_at: now.toISOString(),
                    generation_count: 1,
                    last_generated_at: now.toISOString(),
                  }).eq("user_id", user.id);
                } else {
                  const next = (usage?.generation_count ?? 0) + 1;
                  await supabase.from("usage_tracking").update({
                    generation_count: next,
                    last_generated_at: now.toISOString(),
                  }).eq("user_id", user.id);
                }
              }
            }
          } else {
            const admin = createAdminClient();
            await incrementGuestDaily(admin, getClientIp(request));
          }
          return NextResponse.json({
            rawStory: rawText,
            parsed: result,
            region: region ?? "Ethiopian highlands",
          });
        }
      }
      const clientMessage =
        status === 400
          ? "Story request was invalid. Please try again."
          : status === 401 || status === 403
            ? "Story service authentication failed."
            : status === 429
              ? "Too many requests. Please try again in a moment."
              : "Story service is temporarily unavailable. Please try again.";
      return NextResponse.json(
        { error: clientMessage },
        { status: status && status >= 400 && status < 600 ? status : 502 }
      );
    }
    clearTimeout(timeout);

    let result = parseStory(rawText);
    if (!result || result.am.length < MIN_PAGES) {
      console.log("[teret] parse fallback: initial parse insufficient", { pageCount: result?.am?.length ?? 0 });
      const repairPrompt = `The previous response was not in the required format. Please output the same story again, but STRICTLY in this format for each paragraph:
[AM] Amharic text
[EN] English text
[ES] Spanish text
No other text. No markdown.`;
      try {
        const retryResult = await anthropicMessages(systemPrompt, "", {
          maxTokens: 700,
          signal: controller.signal,
          messages: [
            { role: "user", content: userPrompt },
            { role: "assistant", content: rawText || " " },
            { role: "user", content: repairPrompt },
          ],
        });
        const retryText = retryResult.text;
        result = parseStory(retryText);
        console.log("[teret] parse fallback:", (result?.am?.length ?? 0) >= MIN_PAGES ? "success" : "failed");
      } catch (retryErr) {
        console.error("[generate-story] Retry parse failed", retryErr);
      }
    }

    if (!result || result.am.length < MIN_PAGES) {
      return NextResponse.json(
        { error: "We couldn't format the story. Please try again." },
        { status: 502 }
      );
    }

    // Generate illustration prompts for each page (local by default, AI when env enabled)
    const pageContents = result.en.length ? result.en : result.am;
    const regionObj = region ? REGIONS.find((r) => r.name === region) : null;
    const regionName = regionObj?.name ?? undefined;
    let illustrationPrompts: string[] = [];

    if (AI_ILLUSTRATION_PROMPTS) {
      try {
        const illSystem = buildIllustrationSystemPrompt();
        const illUser = buildIllustrationUserPrompt(
          pageContents,
          storyInspirationForIllustration as StoryInspiration,
          regionName
        );
        const illResult = await anthropicMessages(illSystem, illUser, {
          maxTokens: 400,
          signal: controller.signal,
        });
        illustrationPrompts = parseIllustrationPrompts(illResult.text, result.am.length);
      } catch (illErr) {
        console.warn("[teret] AI illustration prompts failed, using local", illErr);
        illustrationPrompts = buildLocalIllustrationPrompts(
          pageContents,
          storyInspirationForIllustration as StoryInspiration,
          regionName
        );
      }
    } else {
      illustrationPrompts = buildLocalIllustrationPrompts(
        pageContents,
        storyInspirationForIllustration as StoryInspiration,
        regionName
      );
    }
    result.illustrationPrompts = illustrationPrompts;

    const pagesForVocab = parsedToPages(result);
    result.vocabulary = getVocabForStory(pagesForVocab, "en").slice(0, 8);

    if (user) {
      const supabase = await import("@/lib/supabase/server").then((m) => m.createClient());
      if (supabase) {
        const { error: rpcError } = await supabase.rpc("increment_usage", { p_user_id: user.id });
        if (rpcError) {
          const now = new Date();
          const { data: usage } = await supabase.from("usage_tracking").select("generation_count, first_story_at").eq("user_id", user.id).single();
          const { windowExpired } = getSignedInUsageFromRow(usage ?? null, now);
          if (windowExpired) {
            await supabase.from("usage_tracking").update({
              first_story_at: now.toISOString(),
              generation_count: 1,
              last_generated_at: now.toISOString(),
            }).eq("user_id", user.id);
          } else {
            const next = (usage?.generation_count ?? 0) + 1;
            await supabase.from("usage_tracking").update({
              generation_count: next,
              last_generated_at: now.toISOString(),
            }).eq("user_id", user.id);
          }
        }
      }
    } else {
      const admin = createAdminClient();
      const ip = getClientIp(request);
      await incrementGuestDaily(admin, ip);
    }

    console.log("[teret] story generated", { userId: user?.id ?? "guest", pageCount: result.am.length, hasIllustrationPrompts: illustrationPrompts.length > 0 });
    return NextResponse.json({
      rawStory: rawText,
      parsed: result,
      region: region ?? "Ethiopian highlands",
    });
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === "AbortError") {
        return NextResponse.json(
          { error: "Story took too long. Please try again." },
          { status: 504 }
        );
      }
      console.error("[generate-story]", err.name, err.message);
    }
    const apiErr = err as { status?: number; error?: { type?: string; message?: string } };
    const status = apiErr?.status;
    const clientMessage =
      status === 400
        ? "Story request was invalid. Please try again."
        : status === 401 || status === 403
          ? "Story service authentication failed."
          : status === 429
            ? "Too many requests. Please try again in a moment."
            : "Something went wrong. Please try again.";
    return NextResponse.json(
      { error: clientMessage },
      { status: status && status >= 400 && status < 600 ? status : 500 }
    );
  }
}
