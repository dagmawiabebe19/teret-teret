import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import { AGES, REGIONS, TRAITS_EN, ALLOWED_AGES, ALLOWED_REGIONS, ALLOWED_STORY_INSPIRATIONS } from "@/lib/constants";
import {
  FREE_STORIES_PER_DAY,
  getTodayPeriodUTC,
  checkGuestDailyLimit,
  incrementGuestDaily,
  getClientIp,
} from "@/lib/usageDaily";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseStory } from "@/lib/parseStory";
import { getOptionalUser } from "@/lib/supabase/server";
import {
  buildLocalIllustrationPrompts,
  buildIllustrationSystemPrompt,
  buildIllustrationUserPrompt,
  parseIllustrationPrompts,
} from "@/lib/illustrationPrompts";
import { checkRateLimit } from "@/lib/rateLimit";
import type { StoryInspiration } from "@/types";

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
  storyInspiration: z.enum(ALLOWED_STORY_INSPIRATIONS).default("ethiopian_folklore"),
  language: z.enum(["am", "en", "es"]).optional().default("en"),
});

const ANTHROPIC_TIMEOUT_MS = 60_000;
const MIN_PAGES = 2;

/** Model ID supported by Anthropic Messages API. Use a known-good value to avoid 400 invalid_request_error. */
const ANTHROPIC_MODEL = "claude-3-haiku-20240307";

const BEDTIME_SYSTEM_PROMPT = `
=== INTRO ===
You are Aya — an ancient Ethiopian storyteller. Write a SHORT bedtime story for children.

=== LENGTH & STRUCTURE — CRITICAL ===
• Exactly 4–6 pages total. No more.
• Each page = 2–3 short sentences only.
• Keep total output under 600 tokens.
• Use short sentences. Avoid long paragraphs.
• Use simple vocabulary. Avoid complex or rare words.
• Avoid unnecessary narration. Be concise.

=== CONTENT RATING ===
G — STRICTLY ALL AGES.
No violence, death, scary content, romance, or cruel villains. All conflicts resolve through kindness. Warm, comforting endings only.

=== INSPIRATION ===
{inspirationBlock}

=== TONE ===
Warm, gentle, bedtime-friendly. Include a positive moral lesson. Use Ethiopian cultural elements when relevant: names, injera, shiro, jebena, netela, gabi, eucalyptus trees, highland mist, Ethiopian animals (hyena, lion, fox, gelada baboon, ibis).

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
2. Page 2–3: Child hero (exact name) meets a gentle challenge.
3. Page 4–5: Kindness or friendship wins. Warm moment.
4. Final page: End [AM] with "ተረቱ ሄደ ዘንቢሉ መጣ". Short moral.

=== RULES ===
NEVER use markdown. ONLY [AM]/[EN]/[ES] blocks.
`.trim();

function getInspirationBlock(storyInspiration: string): string {
  switch (storyInspiration) {
    case "ethiopian_folklore":
      return `STORY INSPIRATION — ETHIOPIAN FOLKLORE:
Generate a bedtime story inspired by Ethiopian folklore traditions: landscapes, villages, animals, and cultural wisdom. Weave in familiar Ethiopian settings, proverbs, and a warm folkloric tone.`;
    case "bible_moral":
      return `STORY INSPIRATION — BIBLE MORAL:
Generate an original children's story inspired by the moral lessons of biblical stories, such as courage, kindness, forgiveness, faith, and helping others. Do NOT quote the Bible directly. Create a new, imaginative story that teaches these values in a child-friendly way.`;
    case "animal_adventure":
      return `STORY INSPIRATION — ANIMAL ADVENTURE:
Generate an animal adventure story where animals are the main characters. They go on a gentle adventure and learn a positive life lesson. Keep the child as a friend or observer if needed, but the animals drive the story.`;
    case "friendship_story":
      return `STORY INSPIRATION — FRIENDSHIP STORY:
Generate a story about friendship, teamwork, kindness, and helping others. The child hero makes or strengthens friendships and learns how good it feels to be kind and work together.`;
    default:
      return `STORY INSPIRATION — ETHIOPIAN FOLKLORE:
Generate a bedtime story inspired by Ethiopian folklore traditions: landscapes, villages, animals, and cultural wisdom.`;
  }
}

function buildSystemPrompt(age: string, storyInspiration: string): string {
  const ageObj = AGES.find((a) => a.value === age) || AGES[1];
  const inspirationBlock = getInspirationBlock(storyInspiration);
  return BEDTIME_SYSTEM_PROMPT.replace("{inspirationBlock}", inspirationBlock).replace(
    "{ageObj.detail}",
    ageObj.detail
  );
}

function buildUserPrompt(
  childName: string,
  trait: string | undefined,
  region: string | undefined
): string {
  const regionObj = region ? REGIONS.find((r) => r.name === region) : null;
  const setting = regionObj ? regionObj.detail : "the beautiful Ethiopian highlands";
  const traitPhrase = trait && TRAITS_EN.includes(trait) ? trait : "is kind and brave";
  return `Write a short bedtime story (4–6 pages, 2–3 sentences per page) for a child named ${childName} who ${traitPhrase}. Set the story in ${setting}. Make ${childName} the clear hero. Keep it brief.`;
}

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

    const { childName, ageGroup, trait, region, storyInspiration } = parsed.data;

    const { user } = await getOptionalUser();

    // Signed-in: daily free limit (usage_tracking); premium = unlimited
    if (user) {
      const supabase = await import("@/lib/supabase/server").then((m) => m.createClient());
      if (supabase) {
        const { periodStart, periodEnd } = getTodayPeriodUTC();
        const now = new Date();
        await supabase.from("usage_tracking").upsert(
          {
            user_id: user.id,
            generation_count: 0,
            billing_period_start: periodStart.toISOString(),
            billing_period_end: periodEnd.toISOString(),
          },
          { onConflict: "user_id", ignoreDuplicates: true }
        );
        const { data: profile } = await supabase.from("profiles").select("subscription_status").eq("id", user.id).single();
        const isPremium = profile?.subscription_status === "premium" || profile?.subscription_status === "active";
        if (!isPremium) {
          const { data: usage } = await supabase.from("usage_tracking").select("generation_count, billing_period_end").eq("user_id", user.id).single();
          let count = usage?.generation_count ?? 0;
          const storedEnd = usage?.billing_period_end ? new Date(usage.billing_period_end) : null;
          if (!storedEnd || storedEnd <= now) {
            await supabase.from("usage_tracking").update({
              generation_count: 0,
              billing_period_start: periodStart.toISOString(),
              billing_period_end: periodEnd.toISOString(),
            }).eq("user_id", user.id);
            count = 0;
          }
          if (count >= FREE_STORIES_PER_DAY) {
            console.log("[teret] daily usage limit reached", { userId: user.id, count, limit: FREE_STORIES_PER_DAY });
            return NextResponse.json(
              { error: "Free daily limit reached. Resets at midnight UTC. Upgrade for unlimited stories." },
              { status: 402 }
            );
          }
          console.log("[teret] usage check ok", { userId: user.id, count, limit: FREE_STORIES_PER_DAY });
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

    const systemPrompt = buildSystemPrompt(ageGroup, storyInspiration);
    const userPrompt = buildUserPrompt(childName, trait, region);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ANTHROPIC_TIMEOUT_MS);

    const anthropic = new Anthropic({ apiKey });
    let response: Awaited<ReturnType<Anthropic["messages"]["create"]>>;
    try {
      response = await anthropic.messages.create(
        {
          model: ANTHROPIC_MODEL,
          max_tokens: 700,
          temperature: 0.7,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        },
        { signal: controller.signal }
      );
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
            storyInspiration as StoryInspiration,
            regionObj?.name ?? undefined
          );
          result.illustrationPrompts = illustrationPrompts;
          if (user) {
            const supabase = await import("@/lib/supabase/server").then((m) => m.createClient());
            if (supabase) {
              const { error: rpcError } = await supabase.rpc("increment_usage", { p_user_id: user.id });
              if (rpcError) {
                const { data: usage } = await supabase.from("usage_tracking").select("generation_count").eq("user_id", user.id).single();
                const next = (usage?.generation_count ?? 0) + 1;
                await supabase.from("usage_tracking").update({
                  generation_count: next,
                  last_generated_at: new Date().toISOString(),
                }).eq("user_id", user.id);
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

    const rawText =
      response.content
        ?.filter((b) => b.type === "text")
        .map((b) => ("text" in b ? b.text : ""))
        .join("") ?? "";

    let result = parseStory(rawText);
    if (!result || result.am.length < MIN_PAGES) {
      console.log("[teret] parse fallback: initial parse insufficient", { pageCount: result?.am?.length ?? 0 });
      const repairPrompt = `The previous response was not in the required format. Please output the same story again, but STRICTLY in this format for each paragraph:
[AM] Amharic text
[EN] English text
[ES] Spanish text
No other text. No markdown.`;
      try {
        const retry = await anthropic.messages.create(
          {
            model: ANTHROPIC_MODEL,
            max_tokens: 700,
            temperature: 0.7,
            system: systemPrompt,
            messages: [
              { role: "user", content: userPrompt },
              { role: "assistant", content: rawText || " " },
              { role: "user", content: repairPrompt },
            ],
          },
          { signal: controller.signal }
        );
        const retryText =
          retry.content
            ?.filter((b) => b.type === "text")
            .map((b) => ("text" in b ? b.text : ""))
            .join("") ?? "";
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
          storyInspiration as StoryInspiration,
          regionName
        );
        const illResponse = await anthropic.messages.create(
          {
            model: ANTHROPIC_MODEL,
            max_tokens: 400,
            temperature: 0.5,
            system: illSystem,
            messages: [{ role: "user", content: illUser }],
          },
          { signal: controller.signal }
        );
        const illText =
          illResponse.content
            ?.filter((b) => b.type === "text")
            .map((b) => ("text" in b ? b.text : ""))
            .join("") ?? "";
        illustrationPrompts = parseIllustrationPrompts(illText, result.am.length);
      } catch (illErr) {
        console.warn("[teret] AI illustration prompts failed, using local", illErr);
        illustrationPrompts = buildLocalIllustrationPrompts(
          pageContents,
          storyInspiration as StoryInspiration,
          regionName
        );
      }
    } else {
      illustrationPrompts = buildLocalIllustrationPrompts(
        pageContents,
        storyInspiration as StoryInspiration,
        regionName
      );
    }
    result.illustrationPrompts = illustrationPrompts;

    if (user) {
      const supabase = await import("@/lib/supabase/server").then((m) => m.createClient());
      if (supabase) {
        const { error: rpcError } = await supabase.rpc("increment_usage", { p_user_id: user.id });
        if (rpcError) {
          const { data: usage } = await supabase.from("usage_tracking").select("generation_count").eq("user_id", user.id).single();
          const next = (usage?.generation_count ?? 0) + 1;
          await supabase.from("usage_tracking").update({
            generation_count: next,
            last_generated_at: new Date().toISOString(),
          }).eq("user_id", user.id);
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
