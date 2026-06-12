# TTS Pipeline Comparison — Working Sample vs Broken Live Path

**Date:** June 2026  
**Question:** Why does `/public/sample-story-am.mp3` sound correct while live Amharic narration on new stories says "comma" or fails — and why do `[AzureTTS]` logs never appear in Vercel?

**Method:** Side-by-side code audit of `scripts/generate-sample-audio.mjs`, `app/api/tts/route.ts`, `lib/azureSpeech.ts`, and `lib/useTTS.ts`. No code changes in this commit.

---

## Executive Summary

**These are not the same pipeline.**

| | Homepage sample | Live story narration |
|---|----------------|----------------------|
| **Audio source** | Static MP3 in `public/` | `/api/tts` → Azure (premium only) OR browser `SpeechSynthesis` |
| **When built** | Once, offline via Node script | On each play (or from Supabase cache) |
| **Azure called?** | Only at build time on developer machine | Only if user has `hasFullAccess` AND `/api/tts` reaches `synthesizeAmharicSpeech()` |
| **Typical free user** | N/A (static file) | **Never hits Azure** — browser TTS only |

**Most likely explanation for "comma" + no `[AzureTTS]` logs:**

1. **Frontend never reaches Azure** — `usePremiumVoice` is `false` for guests and free signed-in users, so `useTTS` uses **browser SpeechSynthesis**, which often has no `am-ET` voice and reads ASCII `,` / `.` literally as "comma" / "period".
2. **OR** `/api/tts` returns early (401/403/503) with `useBrowserTts: true` → silent fallback to browser TTS (no Azure logs).
3. **OR** Supabase **cache hit** serves a cached MP3 without calling `synthesizeAmharicSpeech()` (no `[AzureTTS]` logs even though Azure was used on first generation).

The sample script and `lib/azureSpeech.ts` SSML logic are **nearly identical**. The bug is almost certainly **routing / gating / fallback**, not a subtle SSML difference between the script and `azureSpeech.ts`.

---

## PART 1 — Working Path: `scripts/generate-sample-audio.mjs`

### What it does

1. Reads `LANDING_SAMPLE_AM` from `lib/landingSample.ts`
2. Builds SSML via mirrored `buildAmharicSsml()` (copy of `lib/azureSpeech.ts`)
3. POSTs SSML to Azure
4. Writes `public/sample-story-am.mp3`
5. Homepage plays that file via `<audio src="/sample-story-am.mp3">` — **never calls `/api/tts`**

### Azure endpoint URL

```javascript
// If AZURE_SPEECH_ENDPOINT is set:
`${endpoint}/cognitiveservices/v1`  // or full URL if already contains /cognitiveservices/v1

// Else:
`https://${AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`
```

Same logic as `lib/azureSpeech.ts` → `azureTtsUrl()`.

### Voice name

```
process.env.AZURE_VOICE_AM?.trim() || "am-ET-MekdesNeural"
```

### Headers sent

```http
Ocp-Apim-Subscription-Key: <AZURE_SPEECH_KEY>
Content-Type: application/ssml+xml
X-Microsoft-OutputFormat: audio-24khz-48kbitrate-mono-mp3
```

Body: raw SSML string (not JSON).

### Amharic text processing

Pipeline (mirrors `lib/azureSpeech.ts` exactly):

1. `stripInvisibleChars` — remove `\u200B-\u200D`, `\uFEFF`
2. `escapeXML` — `& < > " '` only
3. Replace `።` → `<break time="600ms"/>`
4. Replace `፣` → `<break time="400ms"/>`
5. Wrap in `<speak><voice><prosody rate='-25%'>…</prosody></voice></speak>`

**Does NOT process:** ASCII `,` `.` `?` `!` `«` `»` — passed through to Azure as-is.

**Note:** `prepareBedtimeNarrationText()` exists in the script but is **only used for ElevenLabs English**, not Amharic Azure.

### Example SSML (actual, from `LANDING_SAMPLE_AM`)

Input (first ~150 chars):

```
ተረት ተረት! በአዲስ አበባ ላይያ ያሉ አረንጓዴ ተራሮች ላይ ልያ የሰሚ ውለውል ልጅ ነበረች። ልቧ በመላ ኢትዮጵያ ከሁሉም ደፋር ነበረች።
አንድ ጥዋት የቡና ሽታ ባለቀ እና በመስኮቷ ወደ ውስጥ ገባ። አያቷ ቡና እያቀቀለች ነበር፣ አየሩም…
```

SSML (first ~500 chars):

```xml
<speak version='1.0' xml:lang='am-ET'><voice name='am-ET-MekdesNeural'><prosody rate='-25%'>ተረት ተረት! በአዲስ አበባ ላይያ ያሉ አረንጓዴ ተራሮች ላይ ልያ የሰሚ ውለውል ልጅ ነበረች<break time="600ms"/> ልቧ በመላ ኢትዮጵያ ከሁሉም ደፋር ነበረች<break time="600ms"/>
አንድ ጥዋት የቡና ሽታ ባለቀ እና በመስኮቷ ወደ ውስጥ ገባ<break time="600ms"/> አያቷ ቡና እያቀቀለች ነበር<break time="400ms"/> አየሩም እንደ ቤት ሽታ ነበረው<break time="600ms"/>
«ልያዬ» አያቷ ተጮኸች<break time="600ms"/> …
```

Observations on sample text:

- Uses Ge'ez `።` and `፣` (converted to breaks)
- **No ASCII commas** in sample → Azure never sees `,`
- Contains `!` and `«»` — Azure handles these fine in the working MP3

### Libraries / runtime

- Node.js `fs`, `fetch` (native)
- Reads `.env` from shell when script is run (not Vercel)
- **No** Next.js, **no** Supabase cache, **no** auth, **no** browser TTS

### How homepage plays it

`components/landing/SampleAudioSection.tsx`:

```typescript
audio.src = LANDING_SAMPLE_AUDIO[sampleLang]; // "/sample-story-am.mp3"
await audio.play();
```

Zero server involvement at play time.

---

## PART 2 — Live Path: `/api/tts` + `lib/azureSpeech.ts` + `lib/useTTS.ts`

### Frontend: when is `/api/tts` called?

**Only when `usePremiumVoice === true`.**

`lib/useTTS.ts` → `speak()`:

```typescript
if (usePremiumVoiceRef.current) {
  void startPremiumAudio(text, lang);  // → fetch("/api/tts", …)
  return;
}
// else → browser SpeechSynthesis (startUtterance)
```

`usePremiumVoice` is set in `components/StoryReader.tsx`:

```typescript
const fullAccess = hasFullAccess || subscriptionStatus === "premium";
const { speak, … } = useTTS({ usePremiumVoice: fullAccess });
// AudioPlayer also gets usePremiumVoice={fullAccess}
```

`hasFullAccess` comes from `app/page.tsx` → `/api/usage` or `/api/profile` → `hasFullAccess` = premium **OR** `is_ethiopia_free`.

### Who gets Azure vs browser TTS?

| User type | `fullAccess` | `usePremiumVoice` | Play path |
|-----------|--------------|-------------------|-----------|
| Guest | `false` | `false` | Browser TTS (listen mode pages 1–2 only) |
| Free signed-in (diaspora) | `false` | `false` | **Browser TTS** |
| Ethiopia free | `true` | `true` | `/api/tts` → Azure |
| Premium subscriber | `true` | `true` | `/api/tts` → Azure |

**Critical:** After the recent "free users can save stories" fix, many signed-in users are **not** premium. They hear browser TTS but may assume they're getting Azure.

### Silent browser fallback

`lib/useTTS.ts` → `startPremiumAudio()`:

```typescript
const res = await fetch("/api/tts", { … });

if (!res.ok) {
  const data = await res.json().catch(() => ({}));
  if (data.useBrowserTts) {
    // SILENT FALLBACK — no user-visible error
    startUtterance(text, lang, voices);
    return;
  }
}
```

`useBrowserTts: true` is returned by `/api/tts` on:

| Status | Condition |
|--------|-----------|
| 503 | Azure not configured (`!isAzureSpeechConfigured()`) |
| 401 | Not signed in |
| 403 | `!access.hasFullAccess` |
| 503 | Supabase auth/admin unavailable |
| 502 | Azure/ElevenLabs synthesis throws |

**No `[AzureTTS]` logs on any of these paths** — Azure is never called.

### Browser TTS Amharic behavior (`lib/useTTS.ts`)

```typescript
case "am": {
  voice = findVoiceByLang(voices, "am-ET");
  if (!voice) voice = findVoiceByPrefix(voices, "am");
  if (!voice) voice = getDefaultVoice(voices);  // "system default (no Amharic voice)"
}
```

On most mobile browsers: **no `am-ET` voice** → English/system default reads Ge'ez script poorly and **reads ASCII punctuation literally** ("comma", "period", "question mark").

This matches the reported symptom exactly.

### `/api/tts` server flow (`app/api/tts/route.ts`)

```
POST { text, lang }
  │
  ├─ lang === "am" → require isAzureSpeechConfigured()
  ├─ require signed-in user
  ├─ require access.hasFullAccess (premium OR Ethiopia free)
  ├─ cache key = ttsCacheKey(text, lang)  → "azure-am-v4-{sha256}"
  ├─ Supabase download tts-cache/am/{key}.mp3
  │     ├─ HIT  → return MP3 immediately  ⚠️ NO synthesizeAmharicSpeech(), NO [AzureTTS] logs
  │     └─ MISS → synthesizeAmharicSpeech(text)  → [AzureTTS] logs here
  │               → upload to cache → return MP3
  └─ on error → 502 + useBrowserTts: true
```

### Azure endpoint (live)

Identical to script — `lib/azureSpeech.ts` → `azureTtsUrl()`.

### Voice (live)

```typescript
process.env.AZURE_VOICE_AM?.trim() || "am-ET-MekdesNeural"
```

### Headers (live)

Same as script:

```http
Ocp-Apim-Subscription-Key: <AZURE_SPEECH_KEY>
Content-Type: application/ssml+xml
X-Microsoft-OutputFormat: audio-24khz-48kbitrate-mono-mp3
```

### SSML building (live)

Same pipeline as script (`buildAmharicSSMLPipeline` in `lib/azureSpeech.ts`).  
Added in `cb445385`: `[AzureTTS]` debug logs at each stage — **only inside `synthesizeAmharicSpeech()`**.

### Text sent to TTS (live)

From `StoryReader.tsx`:

```typescript
const text = lang === "am" ? current.am : …;
```

This is **Claude-generated page text**, not `LANDING_SAMPLE_AM`. Differences vs sample:

- May contain **ASCII** `,` `.` `?` if Claude used English punctuation in `[AM]` blocks
- May contain mixed content if parse backfill occurred
- Ge'ez `።`/`፣` are converted; **ASCII commas are not**

### Cache behavior

`lib/ttsCache.ts`:

```typescript
ttsCacheKey(text, lang) → `azure-am-v4-${sha256(lang + ":" + text.trim())}`
```

- Cache hit → **Azure never called** → no `[AzureTTS]` logs
- A bad MP3 cached from an earlier generation (wrong text, old pipeline) would replay forever until cache key bump or text change
- Sample MP3 is **not** in this cache — it's a separate static file

---

## PART 3 — Side-by-Side Differences

| Aspect | Sample script | Live `/api/tts` |
|--------|---------------|-----------------|
| **Trigger** | Manual `node scripts/generate-sample-audio.mjs` | User taps play in story reader |
| **Delivery** | Static `/sample-story-am.mp3` | API response or Supabase cache |
| **Auth** | None | Sign-in + `hasFullAccess` required |
| **Azure SSML code** | Mirrored copy in `.mjs` | `lib/azureSpeech.ts` (identical algorithm) |
| **Endpoint / voice / headers** | Same | Same |
| **Input text** | Fixed `LANDING_SAMPLE_AM` | Live `pages[n].am` from Claude |
| **ASCII punctuation in input** | Essentially none | **Likely present** in generated stories |
| **Browser TTS fallback** | Never | Common (free users, API errors) |
| **Cache layer** | None | Supabase `tts-cache` bucket |
| **Logging** | `[azureSpeech] FULL SSML` (script only) | `[AzureTTS] =====` (only on cache miss + synthesis) |
| **Env** | Local `.env` at build time | Vercel production env vars |

### SSML code diff

**None meaningful.** The script explicitly says `// Mirrors lib/azureSpeech.ts`. Line-by-line the pipeline matches.

---

## PART 4 — Where Does the Live Request Actually Go?

### Decision tree (user taps play on Amharic story)

```
User taps play (read mode handleTTS OR listen mode AudioPlayer)
        │
        ▼
usePremiumVoice (= fullAccess) ?
        │
   NO ──┴── YES
   │         │
   ▼         ▼
Browser    fetch POST /api/tts { text, lang: "am" }
SpeechSynthesis      │
(NO [AzureTTS]       ├─ 401/403/503 useBrowserTts → Browser TTS (silent)
 logs ever)          ├─ Cache HIT → return MP3 (NO [AzureTTS] logs)
                     └─ Cache MISS → synthesizeAmharicSpeech() → [AzureTTS] logs
```

### How to confirm path in browser (no code deployed yet)

In DevTools → Network tab while playing:

| What you see | Path taken |
|--------------|------------|
| **No** `POST /api/tts` | Browser TTS only (`usePremiumVoice` false) |
| `POST /api/tts` → 403 + `useBrowserTts: true` | Premium check failed → browser fallback |
| `POST /api/tts` → 200, `X-TTS-Cache: hit` | Cached audio — Azure not called this request |
| `POST /api/tts` → 200, `X-TTS-Cache: miss`, `X-TTS-Provider: azure` | Azure was called — check Vercel for `[AzureTTS]` |

In UI: gold **"✨ Premium"** badge on audio player (`usingPremiumVoice`) means API path succeeded. **No badge** = browser TTS.

### Vercel logs to check

```bash
# Was /api/tts hit at all?
npx vercel logs teretstories.com --since 30m 2>&1 | grep "POST /api/tts"

# Azure synthesis (only on cache miss)
npx vercel logs teretstories.com --since 30m 2>&1 | grep "\[AzureTTS\]"
```

If `POST /api/tts` appears but `[AzureTTS]` does not → **cache hit** or route returned before synthesis.

---

## PART 5 — Likely Culprits (Ranked)

### 🔴 #1 — Browser TTS used instead of Azure (most likely)

**Evidence:**

- "comma" spoken aloud is a **classic browser SpeechSynthesis symptom** with wrong voice / ASCII punctuation
- No `[AzureTTS]` logs = Azure code path not executed
- Free signed-in users now exist in large numbers but `hasFullAccess` is still false for diaspora free tier
- `useTTS` silently falls back on any `/api/tts` error with `useBrowserTts: true`

**Test:** Play as confirmed premium or Ethiopia-free user; check Network for `/api/tts` 200.

### 🔴 #2 — `/api/tts` never called (`usePremiumVoice: false`)

`StoryReader` sets `usePremiumVoice: fullAccess`. If `hasFullAccess` state is stale/false on client while user believes they're premium, browser TTS runs.

**Test:** Verify `GET /api/profile` returns `hasFullAccess: true` for the test account.

### 🟡 #3 — Cache hit serves old/bad audio (no Azure logs)

First request may have cached bad audio; subsequent plays skip `synthesizeAmharicSpeech()`.

**Test:** Check response header `X-TTS-Cache: hit` vs `miss`. Change story text slightly to bust cache hash.

### 🟡 #4 — Live story text has ASCII commas (Azure path only)

Sample has no ASCII `,`; Claude stories may. Azure might speak them; browser **definitely** speaks them as "comma".

**Test:** Compare `pages[n].am` text for `,` and `.` vs Ge'ez `፣` `።`.

### 🟢 #5 — SSML divergence between script and `azureSpeech.ts`

**Ruled out** by code comparison — algorithms match.

### 🟢 #6 — Azure env misconfigured on Vercel

Would return 503 `useBrowserTts: true` → browser fallback. Sample MP3 would still work (pre-generated locally).

**Test:** `POST /api/tts` with premium session → 503 vs 200.

---

## PART 6 — Recommended Next Steps (Diagnosis Only)

1. **Confirm user tier** — Is the test account actually `hasFullAccess: true` (premium or Ethiopia)?
2. **Browser Network tab** — Is `POST /api/tts` fired? What status? `X-TTS-Cache` header?
3. **UI badge** — Does "✨ Premium" appear on the audio player during playback?
4. **If `/api/tts` returns 200 miss** — capture `[AzureTTS]` block from Vercel and compare input text to `LANDING_SAMPLE_AM`
5. **If no `/api/tts` request** — the bug is frontend gating / browser TTS, not Azure SSML

---

## Appendix — File Reference Map

| File | Role |
|------|------|
| `scripts/generate-sample-audio.mjs` | Offline Azure → `public/sample-story-am.mp3` |
| `components/landing/SampleAudioSection.tsx` | Plays static MP3 |
| `lib/azureSpeech.ts` | SSML + Azure fetch (live) |
| `app/api/tts/route.ts` | Auth, cache, provider routing |
| `lib/ttsCache.ts` | `azure-am-v4-{hash}` cache keys |
| `lib/useTTS.ts` | Premium API vs browser TTS decision |
| `components/StoryReader.tsx` | `usePremiumVoice: fullAccess`, page text |
| `components/AudioPlayer.tsx` | Listen mode play button |
| `lib/landingSample.ts` | Source text for working sample |

---

*Audit only — no fixes in this commit.*
