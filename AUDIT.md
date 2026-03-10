# Phase 1 — Audit: ethiopian-stories-v6.jsx

## 1. What already works well
- **Rich UI translations** (AM/EN/ES) for labels, buttons, loading messages, traits
- **Ethiopian regions** with descriptive details for prompts
- **Age groups** (2–4, 5–7, 8–12) with clear prompt instructions
- **Traits** in three languages, English used for API prompt
- **Strong system prompt**: [AM]/[EN]/[ES] blocks, G-rated, Ethiopian setting, structure (teret teret, elder, proverb, ending)
- **parseStory()** reliably extracts [AM]/[EN]/[ES] blocks into pages
- **Decorative components**: Stars, Campfire, Fireflies
- **LangToggle** for Amharic / English / Spanish
- **StoryReader**: page-by-page navigation, swipe, progress bar, end screen with copy/save/another
- **PaywallModal** UI (copy and styling)
- **Loading state**: rotating messages, progress bar, animals
- **Saved stories** panel (localStorage)
- **Copy to clipboard** for full story text
- **Free limit** concept (3 stories) with counter

## 2. What is UI-only or mock behavior
- **CRITICAL — Direct Anthropic call from browser** (line 314): `fetch("https://api.anthropic.com/v1/messages", ...)`. This would require an API key in the client; must be removed. All AI must go through a server route.
- **Paywall**: "Subscribe Now" does nothing (no Stripe).
- **Save story**: writes only to `localStorage` (no DB).
- **Stories used**: only `localStorage` ("teret_used"); no server-side enforcement or DB.
- **No auth**: no sign up, login, or guest vs logged-in behavior.

## 3. What is broken or incomplete
- Anthropic call from client is insecure and must be replaced by server-side API.
- No server-side validation of `childName`, `age`, `region`, `trait`.
- No database persistence for users or stories.
- No real subscriptions or Stripe integration.
- Parsing has no fallback: if the model drifts from [AM]/[EN]/[ES], output can break.
- No retry or repair prompt on parse failure.
- No differentiation between guest (localStorage) and logged-in (DB) flows.

## 4. Full app or component?
- **Full single-page app** in one file: form, loading, reader, paywall, saved list. No routing; single default export `App`.

## 5. Security issues
- **Direct Anthropic API call from client** — API key must never be in the browser; move to server only.
- No server-side validation or sanitization of inputs.
- Child name not sanitized (XSS/injection risk if ever rendered unsafely).
- No rate limiting on generation.
- localStorage is acceptable only for guest drafts/saved list, not for secrets.

## 6. What should be preserved
- **UI** translations object (am/en/es).
- **REGIONS**, **AGES**, **TRAITS_EN** and trait labels in UI.
- **buildSystemPrompt** logic (moved to server).
- **parseStory** logic (moved to server, hardened with repair/validation).
- **Stars**, **Campfire**, **Fireflies**, **LangToggle**, **PaywallModal** styling and behavior.
- **StoryReader** layout, page nav, swipe, end screen.
- **FREE_STORY_LIMIT** = 3.
- Aesthetic: gradients (#0d0d2b → #1a1a4e → #2d1b69), #FFD700, #c44dff, fonts (Nunito, Fredoka One, Lora), keyframe animations (twinkle, fireFlicker, fireflyMove, fadeSlideUp, etc.).
- Flow: home → loading → story → end screen; saved list; paywall when limit reached.

## 7. Target file structure (rebuilt app)
```
/app
  layout.tsx, page.tsx, globals.css
  api/generate-story/route.ts
  api/stripe/webhook/route.ts
  api/stripe/checkout/route.ts
  api/stripe/portal/route.ts
  account/page.tsx
/components
  StoryForm, StoryReader, SavedStoriesPanel, LangToggle, PaywallModal,
  LoadingState, DecorativeBackground, Campfire, Stars, Fireflies,
  AccountSummary, ToastProvider
/lib
  constants (UI, REGIONS, AGES, TRAITS), supabase (client, server),
  stripe, parseStory, validation (Zod), analytics
/hooks
  useStories, useUser, useUsage
/types
  index.ts (StoryPage, Story, etc.)
/supabase
  migrations (profiles, stories, usage_tracking, subscriptions)
/public
  manifest.json, icons
```

---
*Audit complete. Implementation continues in Phases 2–11.*
