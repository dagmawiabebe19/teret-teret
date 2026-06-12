# Teret Stories — Comprehensive Quality Audit

**Date:** June 2026  
**Scope:** Story generation, narration, Amharic UI, auth, paywall, reader, performance, production logs  
**Method:** Full codebase review + production Vercel log sample (last ~24h). No live API keys were used to generate stories or TTS in this audit; generation/TTS findings combine code-path analysis with log evidence.

---

## Executive Summary

Teret Stories has a **solid generation prompt** (grandmother-register Amharic, Ge'ez punctuation rules, Ethiopian cultural anchors) and a **correct Azure SSML fix** for the historical “comma” bug. The biggest product risks are **not broken APIs** but **broken promises and silent failures**:

1. **Signup prompt + account copy promise “save stories”** — free (non-Ethiopia) signed-in users still get **402 on save** (`/api/stories` requires `hasFullAccess`).
2. **Silent fallback stories** when Claude fails — users receive a generic 4-page template with **no UI indication** it is not AI-generated.
3. **Analytics table not deployed** — production logs show `[analytics] insert failed` on every `homepage_view`; funnel metrics are blind.
4. **Amharic UI is almost entirely feminine** (`ልጅሽ`, `ተመዝገቢ`) — wrong for sons; reads unnatural for many families.
5. **`language` request field is ignored** in prompts — UI language does not change generation behavior.

---

## PART 1 — STORY GENERATION

### Architecture

| Step | File | Notes |
|------|------|-------|
| Client POST | `app/page.tsx` → `/api/generate-story` | Sends `language: lang` but prompt is English-only |
| Prompt | `app/api/generate-story/route.ts` L118–250 | Strong Amharic quality instructions |
| Model | `claude-sonnet-4-20250514` | 60s timeout |
| Parse | `lib/parseStory.ts` | Requires ≥2 pages, ≥100 chars; **pages keyed on `[AM]` blocks** |
| Fallback | `generateFallbackStory()` L334–351 | Used on 402/404/429/502/503/504 without user notice |
| Repair | Retry parse via second Claude call if format wrong | |

### Amharic generation

| Question | Finding | Severity |
|----------|---------|----------|
| Valid Amharic from Claude? | Prompt is excellent (conversational register, Ge'ez punctuation, cultural vocabulary). **Cannot verify live output** without API call. | — |
| English mixing in `[AM]`? | Prompt forbids it; **no server-side validation**. `parseStory` accepts any `[AM]` text. English periods/commas in `[AM]` would **not** be stripped (only Azure strips `።`/`፣`). | 🟡 P1 |
| Ge'ez punctuation? | Prompt requires `።` / `፣`. Parser does not enforce. Browser TTS reads raw punctuation. | 🟡 P1 |
| Child name natural in Amharic? | User prompt injects `${childName}` in English sentence; Claude usually adapts. **Fallback always uses feminine verbs** (`ነበረች`, `አገኘች`) regardless of child. | 🟡 P1 |
| Ethiopian cultural detail? | `REGIONS[].detail` sent in English; 15 regions in constants vs 8 in form pills. Good detail in prompts. | ✅ |
| Vercel generation errors? | No `generate-story` 500s in sampled logs (24h). Failures would log `[generate-story] Anthropic request failed`. | — |
| Silent partial/fallback? | **Yes.** On Anthropic failure, `generateFallbackStory()` returns 200 with template story. Client shows success + `trackStoryGenerated`. User cannot tell. | 🔴 P0 |
| `language` param used? | **No.** `language` only stored as `language_default` on persist (L324). System/user prompts are English. Selecting Amharic UI does not bias output. | 🟡 P1 |

### English / Spanish generation

| Question | Finding |
|----------|---------|
| Culturally appropriate? | Prompt asks `[EN]`/`[ES]` to retell same spirit for diaspora; Ethiopian settings embedded via `REGIONS` English detail strings. Generally appropriate. |
| Ethiopian names encoding? | Names passed as UTF-8 JSON; no encoding issues found in pipeline. |
| Empty `[EN]`/`[ES]` | `parseStory` backfills from `[AM]` (L68–69) — user may see Amharic content when reading “English” if Claude omits tags. | 🟡 P1 |

### Parse edge cases

- **Only `[AM]` starts a new page** (`lib/parseStory.ts` L15–21). If Claude outputs `[EN]` first, content is dropped.
- **Minimum 2 pages** — single-page responses fail → repair retry → possible 502.
- **Vocabulary** always extracted with `"en"` (`getVocabForStory(..., "en")`) regardless of story language.

### Landing sample Amharic (not Claude, but user-facing story quality)

`lib/landingSample.ts` LANDING_SAMPLE_AM:

| Line | Issue | Grade |
|------|-------|-------|
| `ልያ የሰሚ ውለውል ልጅ` | **Corrupt / nonsensical** — likely typo for `ልያ የሚባል` or similar | ❌ |
| `የቡና ሽታ ባለቀ` | Awkward — smell “ended”? Should be `ከቡና ቤት ተሰማ` or similar | ❌ |
| `በመስኮቷ ወደ ውስጥ ገባ` | Unnatural word order | ⚠️ |
| Overall sample | Mixed quality vs polished prompt | ⚠️ |

---

## PART 2 — NARRATION (TTS)

### Amharic — Azure (`lib/azureSpeech.ts`)

| Check | Status | Evidence |
|-------|--------|----------|
| “Comma” bug fixed? | **Yes in code** | `።`/`፣` → `<break>` tags before SSML; docs L7–14 |
| Ge'ez escaped correctly? | **Yes** | Replaced with breaks, not spoken |
| XML escaping | `& < > " '` only — correct |
| SSML logging | `console.log("[azureSpeech] FULL SSML:", ssml)` L88 — verifiable in Vercel |
| Cache key bump | `azure-am-v4-${hash}` in `lib/ttsCache.ts` L6–7 — **v4 active** |
| Live listen test | **Not performed** (no Azure key in audit env) | — |

**Residual Amharic TTS risks:**

- English `.` `,` `?` in story text → **may be spoken** by Azure (not stripped).
- Premium Amharic requires **signed-in + `hasFullAccess`** (`app/api/tts/route.ts` L46–65). Guests and free diaspora users never hit Azure.
- Free users on mobile: **browser TTS** with `selectVoice` fallback to **system default (often English voice reading Amharic script)** (`lib/useTTS.ts` L58–70).

### English / Spanish — ElevenLabs (`lib/elevenlabs.ts`)

| Check | Status |
|-------|--------|
| Pacing | `prepareBedtimeNarrationText` adds pauses after punctuation; `stability: 0.75`, `style: 0.3` |
| Ethiopian names | No special pronunciation hints; ElevenLabs may mispronounce |
| Cache | SHA256 key in Supabase `tts-cache` bucket; `X-TTS-Cache: hit/miss` headers |
| Fallback | On 401/403/502/503, returns `useBrowserTts: true` → **silent fallback** (`lib/useTTS.ts` L275–286) |
| Wrong fallback? | Premium users who lose session mid-story may get browser voice without clear message | 🟡 P1 |

### Audio gating in reader

- `audioAllowedThisPage = fullAccess || page < 2` (`StoryReader.tsx` L125).
- **Free users:** listen mode works pages 1–2 only; page 3+ shows paywall copy (`premiumAudioGate`).
- **Ethiopia free / premium:** full Azure/ElevenLabs on all pages when signed in.

### Production TTS logs (24h sample)

No `[tts]` or `[azureSpeech]` errors in sampled window. Absence may mean low premium TTS usage, not absence of bugs.

---

## PART 3 — UI TRANSLATIONS (Amharic)

**Systematic issues:**

1. **Feminine-only address** — Nearly all strings use `ልጅሽ`, `ተመዝገቢ`, `አስቀምጢ` (to a female). No masculine/neutral variant for boys.
2. **English loanwords** — `ፕሪሚየም`, `XP`, `PDF`, `FAQ` left transliterated (acceptable for some audiences, ⚠️ for grandmother tone).
3. **Proxy fallback** — Missing `am` keys fall back to English via `lib/translations.ts` Proxy (L1168+). Most keys exist in `am.ts`.
4. **Wrong billing period copy** — `limitReached` says **“የዚህ ወር” (this month)** but limit is **1 story / 24h rolling** (`lib/usageDaily.ts`).

### Amharic string audit (`lib/translations/am.ts`)

Legend: ✅ natural · ⚠️ awkward · ❌ wrong

#### Core / homepage

| Key | Text (abbrev) | Grade |
|-----|---------------|-------|
| `appTitle` | ተረት ተረት | ✅ |
| `subtitle` | በታሪክ ይማሩ… | ✅ |
| `guestNotice` | እንግዳ ሆነሽ… | ⚠️ feminine only |
| `heroHeadline` | ልጅሽ ጀግና… | ✅ natural, ⚠️ feminine |
| `heroSubheadline` | ልጅሽ አማርኛ ትማር… | ✅ |
| `heroSocialProof` | በሎስ አንጀለስ… | ✅ |
| `formTitle` | ተረቱ ለማን ነው? | ✅ |
| `formNamePlaceholder` | የልጅሽን ስም ጻፊ | ⚠️ feminine |
| `formRegionOpts[5]` | ዳናኪል | ❌ maps to **Afar lowlands** in API (`FORM_REGIONS[5].apiName`) |
| `limitReached` | የዚህ **ወር** ነፃ… | ❌ should be 24h not month |
| `limitReachedToday` | የዛሬ… | ✅ |
| `loading[]` | grandmother tone | ✅ excellent |
| `endSub` | ታሪኩ ሄደ ዘንቢሉ መጣ | ✅ |
| `paywallTitle` | የዛሬ ነፃ ታሪክ አልቀረ | ✅ |
| `signupPromptBenefit1` | ያልተገደበ ታሪኮች አስቀምጪ | ❌ **misleading** — free users cannot save |

#### Auth / account

| Key | Grade | Note |
|-----|-------|------|
| `signUpBtn` | ⚠️ | `ተመዝገቢ` vs nav `ተመዝገብ` — inconsistent |
| `authErrorEmailNotConfirmed` | ✅ | |
| `accountBenefit1` | ❌ | promises save — blocked for free tier |
| `continueWithGoogle` | ✅ | |
| `upgradeToSaveStories` | ✅ honest |

#### Reader / audio

| Key | Grade |
|-----|-------|
| `premiumAudioGate` | ⚠️ “ቀሪውን በፕሪሚየም ስሚ” — OK but English loanword |
| `listenModeSub` | ✅ |
| `audioError` | ✅ |

#### Unused / dead UI copy (in `am.ts` but no homepage wiring)

| Keys | Grade | Note |
|------|-------|------|
| `packsTitle`, `packsSub`, `schoolsTitle`, … | ✅ text quality OK | **Dead strings** — no routes use packs/schools UI |
| `heroLine`, `createStoryHeading` | ✅ | Legacy homepage strings? Not on current `page.tsx` |

#### Story reader hardcoded Amharic (not in `am.ts`)

| Location | Text | Grade |
|----------|------|-------|
| `StoryReader.tsx` L242–247 | `ተረቱ ሄደ ዘንቢሉ መጣ` always shown | ❌ when `lang` is `en`/`es` |

### Spanish UI

`lib/translations.ts` es block is complete for landing; not fully audited line-by-line — no missing-key fallbacks observed for primary flows.

---

## PART 4 — SIGNUP & AUTH FLOW

| Test | Code expectation | Risk |
|------|------------------|------|
| Google sign-in creates profile? | `handle_new_user` trigger on `auth.users` (`001_initial.sql` L77–94) | ✅ if Supabase configured |
| Ethiopia geo on signup | `ensureEthiopiaSignupCountry` sets `is_ethiopia_free` if `ET` (`lib/profileAccess.ts`) | 🟡 Fails silently if geo headers missing (VPN/diaspora) |
| Email confirmation | `signUpSuccess`: “check email” — extra friction | 🟡 P1 |
| Post-story card timing | Shows on `showEnd` when guest + `enableSignupPrompt` + first generated story | ✅ |
| Card once only | `signup_prompted` set **when shown**, not on dismiss | 🟡 User who dismisses never sees again; also never sees if flag set before viewing |
| Child name capitalization | `PostStorySignupPrompt` uses raw `childName` — **no capitalize** | 🟡 “liya” stays lowercase |
| Save after signup | `saveStory` → POST `/api/stories` → **402 unless `hasFullAccess`** | 🔴 P0 misleading vs prompt |
| OAuth callback | `/auth/callback` → `exchangeCodeForSession` | ✅ errors → `/account?error=auth` |
| Migrations 020/021 | Profile selects `is_ethiopia_free`; analytics inserts | 🔴 021 failing in prod logs |

---

## PART 5 — PAYWALL & PREMIUM FLOW

| Check | Finding |
|-------|---------|
| 1 story / day free? | `FREE_STORIES_PER_DAY = 1`, rolling 24h from `first_story_at` (`lib/usageDaily.ts`) | ✅ |
| Daily reset | Rolling window, not calendar midnight — correct per code | ✅ |
| Guest limit | IP-based `rate_limits` table | ✅ |
| Ethiopia free | `hasFullAccess` if `is_ethiopia_free` | ✅ if migration 020 applied |
| Stripe checkout | POST `/api/create-checkout-session`; webhook sets `premium` | ✅ |
| Cancel URL | Now `${returnPath}?cancel=1` (recent fix) | ✅ |
| After payment | Account polls `/api/profile` up to 5×2s for premium | ⚠️ race if webhook slow |
| Premium leak to free? | Save, child profiles, TTS API gated by `hasFullAccess` | ✅ |
| Free leak to premium? | Auto-persist stories only when `hasFullAccessFlag` on generate | ✅ |
| Upgrade shown to premium? | Generally hidden when `hasFullAccess`; Ethiopia shows badge not upgrade | ✅ |
| Upgrade shown to Ethiopia free? | Hidden on pricing section (`showEthiopiaUi`) | ✅ |
| **Misleading upgrade on listen page 3+** | Free users see upgrade for **audio**, not save — OK | ⚠️ confusing vs “free story” |

---

## PART 6 — STORY READER

| Check | Finding |
|-------|---------|
| Mobile page nav | Swipe ±40px (`StoryReader.tsx` L166–170); prev/next buttons | ✅ |
| Audio play | `AudioPlayer` + `useTTS`; Chrome voice loading race handled (`waitForVoices`) | ⚠️ occasional delay |
| Language switch mid-story | `LangToggle` in reader; `text` switches per page (`lang === am/en/es`) | ✅ |
| Saved stories persist | Premium/Ethiopia: DB via generate + manual save. Free signed-in: **local only** | 🔴 |
| Guest saved | `localStorage` via `getLocalSavedStories` | ✅ by design |
| Install prompt | After page 2 of **first ever** story (`installPrompt.ts`); 30-day dismiss cooldown | ✅ logic sound |
| End screen overlay | Post-story signup does not block navigation — dismissible | ✅ |

---

## PART 7 — PERFORMANCE

| Metric | Code / observation | Grade |
|--------|-------------------|-------|
| Homepage load | Full client render (`"use client"` on `app/page.tsx`); large single bundle | 🟡 P1 mobile 4G |
| LCP | Hero + fonts + gradients; no image LCP issues | ⚠️ JS-heavy |
| Story generation | 60s Anthropic timeout; loading animation to 90% | ⚠️ 15–45s typical |
| TTS first play | Cache miss → Azure/ElevenLabs + upload; miss adds latency | ⚠️ |
| TTS cache hit | Supabase storage download — fast | ✅ |
| Sample audio | `/sample-story-en.mp3` 206/304 in logs — OK | ✅ |
| Service worker | `public/sw.js` pass-through only | ✅ |

**Not measured:** Real 4G WebPageTest — recommend Lighthouse mobile on teretstories.com.

---

## PART 8 — ERROR MONITORING (Vercel logs, ~24h sample)

**Source:** `vercel logs teretstories.com --since 24h` (June 2026 sample)

| Level | Endpoint / message | Count (sample) | Notes |
|-------|-------------------|----------------|-------|
| warning | `POST /api/analytics/event` → `[analytics] insert failed homepage_view…` | **Multiple** | **Migration 021 not applied** on production DB |
| 404 | `GET /meta.json` | 2+ | External crawler or missing asset — harmless |
| 200/304 | `GET /`, `/api/usage`, `/api/geo`, `/account` | Many | Healthy |
| — | `POST /api/generate-story` 500 | **None seen** | Low traffic or no failures |
| — | `POST /api/tts` errors | **None seen** | |
| — | Stripe webhook failures | **None seen** | |
| — | Claude/Azure/ElevenLabs explicit errors | **None in window** | |

**Gap:** Without migration 021, server-side funnel analytics are **silently failing** while returning HTTP 200 to client.

---

## PRIORITY BUG LIST

### 🔴 P0 — Blocks users or breaks trust (fix today)

| # | Bug | Location |
|---|-----|----------|
| 1 | **Signup prompt promises “save unlimited stories” but free signed-in users get 402 on save** | `PostStorySignupPrompt`, `app/page.tsx` `saveStory`, `/api/stories` |
| 2 | **Silent fallback story on Claude failure** — users think they got AI story | `generate-story/route.ts` L490–531 |
| 3 | **`analytics_events` table missing in production** — all server analytics fail | Logs; migration `021_analytics_events.sql` |
| 4 | **Account benefits / Amharic copy promise save + unlimited** for users who cannot | `am.ts` `accountBenefit1`, `signupPromptBenefit1` |

### 🟡 P1 — Significantly degrades experience (fix this week)

| # | Bug | Location |
|---|-----|----------|
| 5 | `language` UI selection does not affect generation prompts | `generate-story/route.ts` |
| 6 | Fallback template uses **feminine Amharic** for all children | `generateFallbackStory()` |
| 7 | End screen **hardcoded Amharic** closing phrase in all languages | `StoryReader.tsx` L242–247 |
| 8 | `limitReached` Amharic says **“this month”** not 24h | `am.ts` L37 |
| 9 | Region pill **“Danakil” / “ዳናኪል”** labels **Afar lowlands** API region | `formRegionOpts` vs `FORM_REGIONS` |
| 10 | Landing sample Amharic **typos / broken phrases** | `lib/landingSample.ts` |
| 11 | Feminine-only Amharic UI (`ልጅሽ`) for all users | `am.ts` throughout |
| 12 | Free users: **premium audio gated after page 2** without clear upfront expectation | `StoryReader.tsx` |
| 13 | Browser Amharic TTS **falls back to English voice** on most phones | `lib/useTTS.ts` |
| 14 | `signup_prompted` localStorage set on **show**, not signup — one shot forever | `StoryReader.tsx` L139 |
| 15 | Migration **020** may be unapplied on some envs — Ethiopia free tier + profile fields | Supabase |
| 16 | Parse backfill: empty `[EN]` shows Amharic body | `lib/parseStory.ts` L68–69 |
| 17 | No server validation of Ge'ez punctuation in `[AM]` blocks | generation pipeline |

### 🟢 P2 — Polish (when time)

| # | Bug | Location |
|---|-----|----------|
| 18 | Dead translation strings (packs, schools, printables) | `am.ts` |
| 19 | `signUpBtn` / `navSignUp` inconsistent imperatives | `am.ts` |
| 20 | `trackFirstStoryComplete` alias naming confusion | `lib/analytics.ts` |
| 21 | Duplicate Stripe checkout route (`/api/stripe/checkout` GET) | unused by UI |
| 22 | Homepage fully CSR — weak SEO for story content | `app/page.tsx` |
| 23 | `meta.json` 404 — investigate crawler | production logs |
| 24 | Child name not title-cased in signup prompt | `PostStorySignupPrompt.tsx` |
| 25 | English periods in Amharic TTS not converted to breaks | `azureSpeech.ts` |

---

## Recommended fix order (before new features)

1. Apply Supabase migrations **020** + **021** on production.
2. Align signup copy with reality: either **allow 1 saved story on free signup** or change prompt/benefits text.
3. Surface fallback stories: toast “We used a backup story — try again later for a custom one.”
4. Fix Amharic `limitReached` + region label mismatch + landing sample typos.
5. Add neutral or gender-aware Amharic (or use child name: “ልያ’s story”).
6. Wire `language` into Claude user prompt (“prioritize [AM] as primary display language”).

---

## What is NOT broken (verified in code)

- Azure SSML Ge'ez → `<break>` pipeline (comma bug fix present).
- Cache key `azure-am-v4-*` versioning.
- Rolling 24h free story limit logic.
- Stripe webhook → `profiles.subscription_status = premium`.
- Google OAuth callback flow.
- Ethiopia pricing section hidden when `showEthiopiaUi`.
- `hasFullAccess` gating on TTS API, child profiles, story persist.
- Install prompt gating (page 2, first story, PWA).

---

*Audit only — no code changes made in this commit.*
