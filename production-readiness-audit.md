# Teret Stories — Production Readiness Audit

**Date:** June 2026  
**Site:** [teretstories.com](https://teretstories.com)  
**Method:** Full codebase review, architecture tracing, Vercel log sample (24h), cross-reference with prior audits (`teret-quality-audit.md`, `tts-pipeline-comparison.md`). **No live end-to-end browser tests or story generation runs** were executed in this audit (no production API keys in audit environment). Flow conclusions are from code-path analysis + log evidence.

---

## Executive Summary

Teret Stories has a **strong product core**: trilingual generation prompts, Azure/ElevenLabs narration for signed-in users, rolling daily limits, Stripe billing, Ethiopia geo tier, and recent fixes for save access, narration routing, Amharic ASCII leaks, and TTS error handling.

**Do not scale paid marketing yet.** Three **security blockers** in Supabase RLS allow any signed-in user to self-grant premium, reset usage quotas, or call `increment_usage` for arbitrary users. Separately, **silent fallback stories** and **“real human narration”** marketing copy create trust/legal risk at scale.

**Recent fixes (already on `main`):** free signed-in save (`09906975`), signed-in Azure/ElevenLabs (`a3effa2b`), TTS 502 hardening (`6d37b91a`), Amharic ASCII leak strip (`d26b48a5`).

---

## 1. CORE USER FLOWS

*Audited via code paths; not live-clicked in production.*

### Anonymous guest

| Step | Expected | Code reality | Grade |
|------|----------|--------------|-------|
| Lands on homepage | See hero, form, sample audio | `app/page.tsx` CSR homepage, `SampleAudioSection` plays static MP3 | ✅ |
| Generates 1 story | Success | Guest IP limit via `rate_limits` (`lib/usageDaily.ts`) | ✅ |
| Generates 2nd same day | Blocked | API 402 + paywall toast (`page.tsx` L461–458) | ✅ |
| Client paywall before usage loads | Blocked | **Gap:** `usage === null` allows client to start generation; server still 402 (`page.tsx` L414–418) | 🟡 P1 |
| Finishes story → signup card | Shown once | `PostStorySignupPrompt` when guest + `enableSignupPrompt` + end screen; `signup_prompted` set on show (`StoryReader.tsx` L137–144) | ⚠️ |
| Google signup from card | Creates account | OAuth to `/` — **loses in-progress story** (`StoryReader.tsx` L172) | 🟡 P1 |
| Email signup from card | Account created | Link to `/account?mode=signup&from=prompt` — no `returnTo` | 🟡 P1 |

### Free signed-in user

| Step | Expected | Code reality | Grade |
|------|----------|--------------|-------|
| Generate story | 1/day rolling 24h | `usage_tracking.first_story_at` window (`lib/usageDaily.ts`) | ✅ |
| Save story | Works | `canSaveStories` + `POST /api/stories` (no premium gate) | ✅ (fixed) |
| Listen Amharic (Azure) | Mekdes voice | `useApiNarration = !isGuest` → `/api/tts` (`StoryReader.tsx` L110) | ✅ (fixed) |
| 2nd story same day | Blocked | API 402 at `generate-story` L400–405 | ✅ |
| Duplicate story in library | One row | **Auto-persist on generate** + manual Save can create **duplicate DB rows** (`generate-story` L317–332, `page.tsx` saveStory) | 🟡 P1 |
| TTS daily budget | 10k chars/day | `daily_tts_usage` migration 023; fails open if table missing (`lib/ttsUsageDaily.ts`) | 🟡 P1 |

### Premium user

| Step | Expected | Code reality | Grade |
|------|----------|--------------|-------|
| Unlimited generation | Yes | `hasFullAccess` bypasses usage check | ✅ |
| Unlimited narration | Yes | TTS budget skipped when `hasFullAccess` | ✅ |
| Child profiles | CRUD | Gated `hasFullAccess` on API + UI | ✅ |
| After Stripe checkout | Premium unlocks | Webhook sets `subscription_status: premium`; account polls 5×2s | ⚠️ race if webhook slow (`account/page.tsx`) | 🟡 P1 |
| Post-checkout redirect | Return to story/home | **`returnTo` query param ignored** on account page | 🟡 P1 |

### Ethiopia user

| Step | Expected | Code reality | Grade |
|------|----------|--------------|-------|
| Geo-detected ET | Free unlimited | `is_ethiopia_free` set once on first auth request from geo headers (`lib/profileAccess.ts`) | ⚠️ |
| No pricing shown | Hidden | `showEthiopiaUi = isEthiopiaGeo \|\| isEthiopiaFree` (`page.tsx`) | ⚠️ |
| Geo cookie vs profile | Consistent | **Mismatch:** cookie can show Ethiopia UI while profile lacks `is_ethiopia_free` if geo headers missing on first API call | 🟡 P1 |

### Story reader

| Step | Expected | Code reality | Grade |
|------|----------|--------------|-------|
| Pagination | Swipe + buttons | `StoryReader.tsx` touch ±40px, prev/next | ✅ |
| Audio all pages (signed-in) | Yes | `audioAllowedThisPage = !isGuest \|\| page < 2` — signed-in: all pages | ✅ |
| Audio guest pages 3+ | Gated | Listen mode shows sign-in CTA; **read-mode 🔊 has no page gate** — guests get browser TTS on all pages | 🟡 P1 |
| Cache replay | Instant | Supabase `tts-cache` hit → no synthesis; `X-TTS-Cache: hit` | ✅ |
| Saved stories persist | DB | `stories` table + RLS `user_id = auth.uid()` | ✅ |

### Account page

| Step | Expected | Code reality | Grade |
|------|----------|--------------|-------|
| Premium status | Correct | From `profiles.subscription_status` + Ethiopia flag | ✅ |
| Cancel subscription | Stripe portal | `href="/api/stripe/portal"` — requires `stripe_customer_id` | ⚠️ manual grants fail | 🟡 P1 |
| Downgrade webhook | `free` status | `customer.subscription.deleted/updated` → `subscription_status: free` (`webhook/route.ts` L175–194) | ✅ |

---

## 2. CONTENT QUALITY

*Cannot grade 5 live stories without Anthropic API. Assessment from prompts, parsers, samples, and log evidence.*

### Amharic

| Criterion | Assessment | Grade |
|-----------|------------|-------|
| Grandmother-style prompt | Excellent system prompt in `generate-story/route.ts` (Aya register, dialogue, sensory detail) | ✅ |
| English letter leaks | **Mitigated** — `sanitizeAmharicStoryText` + ASCII repair re-prompt (`storyTextSanitize.ts`, `d26b48a5`) | 🟡 P1 (reactive, not prevented at source) |
| Ge'ez punctuation | Prompt requires `።`/`፣`; **no server validation** | 🟡 P1 |
| Cultural authenticity | `REGIONS[].detail` embedded; strong when Claude succeeds | ✅ |
| Child name | Injected in prompt; fallback uses feminine verbs for all | 🟡 P1 |
| Landing sample | **Corrupt copy** in `LANDING_SAMPLE_AM` (`ልያ የሰሚ ውለውል`, `ባለቀ`) | 🟡 P1 |

### English / Spanish

| Criterion | Assessment | Grade |
|-----------|------------|-------|
| Warm / engaging | Prompt asks for read-aloud rhythm, hooks, humor | ✅ (when Claude succeeds) |
| Ethiopian details | Region strings in English in prompt | ✅ |
| Spanish naturalness | Prompt says retell spirit, not literal; **not validated** | 🟡 P1 |
| Cross-language plot parity | Same `[AM]`/`[EN]`/`[ES]` blocks; empty EN/ES **backfill to Amharic** (`parseStory.ts` L79–80) | 🟡 P1 |

### Generation pipeline risks

| Issue | Severity |
|-------|----------|
| **Silent fallback story** on Anthropic 429/502 — generic template, HTTP 200, no degraded flag | 🔴 P0 |
| `language` UI param **not used** in prompts | 🟡 P1 |
| `parseStory` only `[AM]` starts new page — `[EN]`-first pages drop content | 🟡 P1 |
| FAQ claims stories are **“reviewed”** — no human review in code | 🟡 P1 |

---

## 3. NARRATION QUALITY

### Architecture (current)

| User | Path | Provider |
|------|------|----------|
| Everyone (homepage) | `/sample-story-am.mp3` | Pre-baked Azure (offline script) |
| Guest in reader | Browser `SpeechSynthesis` | System voice (often English reading Ge'ez) |
| Signed-in | `POST /api/tts` | Azure (`am`) / ElevenLabs (`en`/`es`) |

### Amharic (Azure Mekdes)

| Check | Status |
|-------|--------|
| Signed-in users reach Azure | ✅ Fixed (`a3effa2b`) |
| SSML Ge'ez `።`/`፣` → breaks | ✅ `lib/azureSpeech.ts` |
| ASCII punct stripped before SSML | ✅ `sanitizeForAmharicSsml` |
| Production 502s | **Observed** in Vercel logs (`[AzureTTS] Azure error body`) — mitigated in `6d37b91a` (sanitization, `maxDuration=30`, no silent browser fallback) | 🟡 P1 — **verify post-deploy** |
| Sample vs live pipeline differ | Sample script lacks live sanitization; static MP3 can sound better | 🟡 P1 |
| Full SSML logged every request | Privacy/noise in Vercel logs | 🟢 P2 |

### English / Spanish (ElevenLabs)

| Check | Status |
|-------|--------|
| Bedtime pacing | `prepareBedtimeNarrationText` pauses | ✅ |
| Ethiopian name pronunciation | No hints | 🟡 P1 |
| Same voice ID default for en/es | Acceptable | ✅ |

### Cache

| Check | Status |
|-------|--------|
| Key = `lang + text` hash | `ttsCache.ts` `azure-am-v5-*` | ✅ |
| Replay = no Azure call | Cache hit returns MP3, no `[AzureTTS]` logs | ✅ |
| Budget not charged on cache hit | Correct — usage only on miss | ✅ |

---

## 4. SIGNUP & PAYWALL FLOWS

| Flow | Finding | Grade |
|------|---------|-------|
| Google OAuth | `/auth/callback` → `exchangeCodeForSession` → `handle_new_user` trigger | ✅ |
| Email signup | Confirmation required; extra friction | 🟡 P1 |
| Post-story card timing | End screen + guest + first generated story | ✅ |
| Card dismissal | `signup_prompt_dismissed` localStorage | ✅ |
| Card “shown once” | `signup_prompted` set **on show**, not dismiss — user can miss prompt permanently if flag set early | 🟡 P1 |
| Google from card creates profile | Yes via trigger | ✅ |
| Google signup analytics | **Mis-attributed** — account page sets `signup_from_prompt` for all sign-up mode OAuth (`account/page.tsx`) | 🟢 P2 |
| Premium upgrade button | `PaywallModal` → `create-checkout-session` | ✅ |
| Stripe checkout completes | Webhook `checkout.session.completed` | ✅ |
| Premium unlock timing | Poll up to 10s; silent failure if webhook delayed | 🟡 P1 |
| Cancel subscription | Stripe Customer Portal `/api/stripe/portal` | ✅ if `stripe_customer_id` exists |
| Dual checkout routes | `GET /api/stripe/checkout` vs `POST /api/create-checkout-session` — **different cancel URLs** | 🟢 P2 |
| Paywall when Stripe disabled | Modal closes silently for signed-in users | 🟡 P1 |

---

## 5. PERFORMANCE

*No live WebPageTest or 4G measurement. Build + architecture estimates.*

| Metric | Observation | Grade |
|--------|-------------|-------|
| Homepage | **Full CSR** (`"use client"` on `app/page.tsx`); ~216 kB First Load JS (build) | 🟡 P1 on 4G |
| Story generation | 60s Anthropic timeout; typical 15–45s | ⚠️ acceptable |
| First TTS (cache miss) | Azure + upload; `maxDuration=30` on `/api/tts` | 🟡 P1 |
| Cached TTS replay | Supabase storage download — fast | ✅ |
| Vercel timeouts | TTS 502s observed pre-fix; generate-story Anthropic failures logged | 🟡 P1 |
| `GET /meta.json` 404 | Crawler noise in logs — harmless | 🟢 P2 |

---

## 6. ERROR HANDLING

| Scenario | Behavior | Grade |
|----------|----------|-------|
| Network loss mid-generation | Generic error toast, return home (`page.tsx` catch) | 🟡 P1 — no offline-specific copy |
| Daily TTS budget hit | 429 + `ttsDailyLimit` toast | ✅ |
| Daily story limit | 402 + paywall | ✅ |
| Duplicate save | Client dedup by `libraryStories`; **server allows duplicates** after auto-persist | 🟡 P1 |
| Email already exists | Supabase error mapped in translations | ✅ |
| Child name emoji/numbers | Allowed up to 80 chars; strips `<>"'&` only (`GenerateStorySchema`) | 🟡 P1 — emoji pass through to Claude/Azure |
| Very long name | Truncated at 80 | ✅ |
| Azure down | 503 `audioUnavailable` toast — **no browser fallback** for signed-in (`6d37b91a`) | ✅ |
| Anthropic down | **Silent fallback story** — worst UX failure | 🔴 P0 |
| Save/delete errors | Often **silent** (no toast) | 🟡 P1 |
| Rate limits / global cap / TTS budget DB errors | **Fail open** (allow request) | 🟡 P1 |

---

## 7. MOBILE-SPECIFIC

*Code review only — not tested on physical iPhone/Android.*

| Check | Finding | Grade |
|-------|---------|-------|
| iPhone Safari / Android Chrome | PWA manifest, apple-web-app meta, responsive layout | ✅ structure |
| Tap targets 44px | Some nav elements `min-h-[44px]` (`AppNav.tsx`); not audited on all buttons | 🟡 P1 |
| Audio with screen locked | Web Audio API / `<audio>` — **OS may pause**; no Media Session API | 🟡 P1 |
| PWA install prompt | Page 2 of first story, 30-day dismiss (`lib/installPrompt.ts`) | ✅ |
| iOS keyboard covering inputs | No `visualViewport` handling found | 🟡 P1 |
| Amharic font | `Noto Sans Ethiopic` / `--font-amharic` | ✅ |
| Browser TTS on mobile | No `am-ET` voice on most devices — guests hear poor narration | 🟡 P1 (by design for guests) |

---

## 8. EDGE CASES

| Scenario | Behavior | Grade |
|----------|----------|-------|
| Midnight limit reset | **Rolling 24h** from `first_story_at`, not calendar midnight | 🟢 P2 — document clearly |
| Premium → free downgrade | Webhook sets `subscription_status: free`; saved stories **remain**; generation re-limited; TTS budget applies | ✅ |
| Stripe webhook delayed | User may wait on account page; no error after poll timeout | 🟡 P1 |
| Azure completely down | `audioUnavailable` message | ✅ |
| Amharic in child name field | Passed to Claude; may confuse TTS | 🟡 P1 |
| Guest → sign-in mid-session | Local saves not migrated to DB automatically | 🟡 P1 |
| VPN Ethiopia UI without profile flag | Marketing says unlimited; server limits to 1/day | 🟡 P1 |
| `signup_prompted` set before modal visible | Never prompted again | 🟡 P1 |

---

## 9. SECURITY

| Check | Finding | Grade |
|-------|---------|-------|
| **profiles UPDATE RLS** | **Any column writable by user** — can set `subscription_status: premium`, `is_ethiopia_free: true` via browser Supabase client | 🔴 P0 |
| **usage_tracking UPDATE RLS** | User can reset `generation_count` / `first_story_at` | 🔴 P0 |
| **`increment_usage(uuid)` RPC** | `SECURITY DEFINER`, granted to `authenticated`, **no `auth.uid()` check** | 🔴 P0 |
| stories RLS | CRUD scoped to `auth.uid() = user_id` | ✅ |
| child_profiles RLS | Owner-scoped | ✅ |
| Free user reads other's stories | **Blocked** by `user_id` filter on API | ✅ |
| Admin stats | `ADMIN_SECRET` bearer check (`lib/adminAuth.ts`) | ✅ |
| API rate limits | IP + guest daily; **fails open** on DB error | 🟡 P1 |
| Daily story limit bypass | RLS tampering + RPC abuse | 🔴 P0 |
| Analytics ingest | `POST /api/analytics/event` **unauthenticated, unrated** | 🟡 P1 |
| Stripe webhook | Signature verified | ✅ |
| TTS cache public read | Hash-based paths — intentional | ✅ |
| Webhook error responses include `logs` | Info leak to Stripe retries | 🟢 P2 |

---

## 10. POLISH

| Check | Finding | Grade |
|-------|---------|-------|
| “Real human narration” (EN) | Contradicts AI stack (`trustNarration`, `trustStrip`) | 🔴 P0 for paid marketing |
| Amharic `limitReached` says “this month” | Limit is 24h rolling | 🟡 P1 |
| Danakil / Afar region label mismatch | `formRegionOpts[5]` vs API `Afar lowlands` | 🟡 P1 |
| Feminine-only Amharic (`ልጅሽ`) | Wrong for sons | 🟡 P1 |
| `signUpBtn` vs `navSignUp` inconsistent | Amharic imperatives | 🟢 P2 |
| End screen hardcoded Amharic phrase | Shows in EN/ES mode (`StoryReader.tsx`) | 🟡 P1 |
| Dead UI strings | packs/schools/printables in `am.ts` | 🟢 P2 |
| `GET /meta.json` 404 | Logs only | 🟢 P2 |
| Console errors on load | Not measured live | — |
| Vercel 500s (24h sample) | Mostly 404 noise; analytics 200 (021 may be applied) | ✅ improved |

---

## 11. DATA INTEGRITY

| Check | Finding | Grade |
|-------|---------|-------|
| Migrations 020–023 on production | **Cannot verify from repo** — apply via Supabase dashboard | ⚠️ action required |
| 020 `is_ethiopia_free`, `signup_country` | Required for Ethiopia tier | ⚠️ |
| 021 `analytics_events` | Recent logs show 200 on ingest (improved vs prior failures) | ✅ likely applied |
| 022 indexes | Performance only | 🟢 P2 |
| 023 `daily_tts_usage` | TTS budget; code fails open if missing | 🟡 P1 |
| Orphan profiles | `handle_new_user` trigger on signup | ✅ |
| Duplicate stories | Auto-persist + manual save | 🟡 P1 |
| `signup_country` populated | Once on first auth request with geo | ⚠️ null if geo missing |
| Double `story_generated` analytics | Server + client both fire | 🟡 P1 |

---

## 12. ANALYTICS

| Check | Finding | Grade |
|-------|---------|-------|
| Vercel Analytics page views | `@vercel/analytics/next` in `app/layout.tsx` | ✅ |
| Custom events (client) | Dual-write Vercel + `POST /api/analytics/event` (`lib/analytics.ts`) | ✅ |
| Custom events (server) | generate-story, checkout, webhook | ✅ |
| UTM parameters | **Not captured** anywhere in codebase | 🟡 P1 for paid campaigns |
| `story_generated` double-count | Client `trackFirstStoryComplete` + server insert | 🟡 P1 |
| Signup prompt shown → `signup_started` | Event aliasing inflates funnel | 🟢 P2 |
| Open ingest endpoint | Metric poisoning risk | 🟡 P1 |
| Admin funnel | `/api/admin/stats` with conversion rates | ✅ if 021 applied |

---

## PRIORITY MASTER LIST

### 🔴 P0 — Production blockers (fix before promoting)

| # | Issue | Location |
|---|-------|----------|
| 1 | **Users can self-grant premium / Ethiopia free** via unrestricted `profiles` UPDATE RLS | `supabase/migrations/001_initial.sql` L59–61 |
| 2 | **Users can reset story quotas** via unrestricted `usage_tracking` UPDATE RLS | `001_initial.sql` L70–72 |
| 3 | **`increment_usage(uuid)` callable for any user ID** without auth check | `006_fix_increment_usage.sql` |
| 4 | **Silent fallback stories** on Claude failure — users think they got AI content | `app/api/generate-story/route.ts` L490–533 |
| 5 | **“Real human narration”** marketing copy vs Azure/ElevenLabs AI stack | `lib/translations.ts` `trustNarration`, `trustStrip` |

### 🟡 P1 — Significant (fix this week)

| # | Issue |
|---|-------|
| 6 | Duplicate DB stories (auto-persist + manual save) |
| 7 | Guest read-mode audio bypasses page-2 listen gate |
| 8 | Ethiopia geo UI ≠ server `is_ethiopia_free` mismatch |
| 9 | Post-checkout `returnTo` ignored |
| 10 | OAuth from story/post-story loses story context |
| 11 | Fail-open rate limits, global cap, TTS budget on DB errors |
| 12 | Unauthenticated `/api/analytics/event` ingest |
| 13 | Double `story_generated` event counting |
| 14 | No UTM capture for paid campaigns |
| 15 | Landing sample Amharic corrupt copy |
| 16 | English/Spanish backfill to Amharic when blocks empty |
| 17 | Feminine-only Amharic UI; `limitReached` “month” wording |
| 18 | Homepage full CSR — slow on 4G |
| 19 | Verify Azure TTS stable post-`6d37b91a` in production |
| 20 | Apply migration 023 if not on production |
| 21 | Premium webhook race / silent activation failure |
| 22 | Client allows generation before usage API loads |

### 🟢 P2 — Polish (when time)

| # | Issue |
|---|-------|
| 23 | Dead translation strings (packs/schools) |
| 24 | Dual Stripe checkout routes |
| 25 | Orphan `/public/sample-story.mp3` |
| 26 | End screen Amharic hardcoded in all languages |
| 27 | `signup_prompted` set before modal render |
| 28 | Guest local saves not migrated on sign-in |
| 29 | Verbose Azure SSML logging in production |
| 30 | `GET /meta.json` 404 crawler noise |

---

## PROMOTION READINESS VERDICT

## ❌ NOT READY

**Reason:** **5 P0 issues**, including **3 critical Supabase RLS/RPC vulnerabilities** that let any signed-in user bypass payment and usage limits without Stripe. Scaling marketing before fixing these exposes unlimited free premium access and corrupts funnel data.

**Minimum bar to reach ⚠️ NEEDS FIXES (1–3 P0s):**

1. Lock down `profiles` UPDATE (column-level or revoke client UPDATE; server-only writes for `subscription_status`, `is_ethiopia_free`, `signup_country`)
2. Lock down `usage_tracking` UPDATE (same pattern)
3. Restrict `increment_usage` to `service_role` only + add `auth.uid() = p_user_id` guard
4. Surface fallback stories to users (or return 503 instead of fake story)
5. Change EN marketing from “real human narration” to “warm AI narration”

**After security + trust fixes:** address P1 narration verification, duplicate saves, and UTM tracking before large ad spend.

---

## Recommended Pre-Launch Checklist

- [ ] Apply Supabase migrations **020, 021, 022, 023** on production (confirm in dashboard)
- [ ] Ship RLS hardening migration (new `024` recommended)
- [ ] Manual test: free signed-in → generate → Amharic play → replay (cache hit) → 2nd story blocked
- [ ] Manual test: Stripe checkout → premium unlock → portal cancel → downgrade
- [ ] Manual test: guest → 2 stories blocked → signup → save → narration
- [ ] Replace landing `LANDING_SAMPLE_AM` copy and regenerate `sample-story-am.mp3`
- [ ] Add UTM capture to `analytics_events.properties`
- [ ] Run Lighthouse mobile on teretstories.com after RLS fix deploy

---

*Audit only — no code changes in this commit.*
