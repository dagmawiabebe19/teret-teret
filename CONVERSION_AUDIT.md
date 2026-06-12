# Teret Stories — Full Conversion Audit

**Date:** June 2026  
**Traffic:** Instagram Reels/ads · majority Ethiopia · mobile-first  
**Goal:** Maximize visitor → signup → subscriber conversion

---

## Executive Summary

Teret Stories has a strong emotional product (personalized Amharic bedtime stories) but loses most Instagram traffic before signup. The highest-impact bottlenecks are: **(1)** homepage-to-first-story friction and scroll depth, **(2)** 1-story/day limit hitting before emotional signup peak, **(3)** save/library locked behind paywall for free users, **(4)** email verification friction vs Google, **(5)** weak server-side funnel visibility (now fixed).

This audit implemented **server-side analytics in Supabase**, an **enhanced `/api/admin/stats`**, **SEO basics**, **Stripe checkout fixes**, and **safe UX tweaks** without changing core paywall economics.

---

## 1. Conversion Funnel Map

| Stage | Event | Est. drop-off | Primary cause |
|-------|--------|---------------|---------------|
| Homepage visit | `homepage_view` | — | Instagram ad click |
| CTA click | `cta_click` | **~70–85%** | Hero CTA below fold on small screens; form requires scroll |
| Story started | `story_started` | **~30–50%** of clickers | Name-only gate OK; loading anxiety |
| Story generated | `story_generated` | **~10–20%** | API errors, daily cap 402, global cap 503 |
| Signup started | `signup_started` | **~85–95%** of completers | No account required to read; prompt is soft/once |
| Signup completed | `signup_completed` | **~40–60%** of starters | Email confirm; Google faster |
| Checkout started | `checkout_started` | **~95%+** of users | Ethiopia free tier; diaspora price sensitivity |
| Subscription started | `subscription_started` | **~50–70%** of checkouts | Stripe drop-off |

**Biggest leak:** Homepage visit → story started (mobile scroll + unclear “what happens next”).  
**Second biggest:** Story completed → signup (free story already delivered; save is paywalled).

---

## 2. Mobile UX Findings

| Issue | Severity | Status |
|-------|----------|--------|
| Form below hero requires scroll | High | Partial — hero tightened in prior commit; name field now `autoFocus` |
| Sign in only in nav (no Sign up) | High | **Fixed** — Sign up pill added |
| Post-story signup prompt | High | **Fixed** — soft overlay after first generated story |
| 44px+ tap targets on nav | Medium | OK on Sign up pill |
| Story reader end screen busy | Medium | Monitor — many buttons compete with signup |
| Client-rendered homepage (SEO) | Medium | Metadata improved; content still CSR |

---

## 3. Homepage

| Element | Assessment | Action |
|---------|------------|--------|
| Headline | Clear post-fix | Keep A/B testing Amharic default for ET traffic |
| Subheadline | Emotional | Good |
| CTA | Strong gradient | `cta_click` now tracked server-side |
| Social proof | Diaspora vs ET variants | **Implemented** Ethiopia geo copy |
| Pricing section | Hidden for ET | Correct for free tier |
| Trust section | Present | Consider parent photos/video testimonial |

---

## 4. Signup Flow

| Item | Friction | Recommendation |
|------|----------|----------------|
| Google OAuth | Low | Promote on post-story prompt |
| Email + password | Medium | Email confirmation required |
| Default `/account` mode | Signup | **Implemented** |
| `returnTo` after auth | Works | — |
| Post-story prompt | Low friction | **Implemented** + analytics |

---

## 5. Story Creation

| Field | Required | Note |
|-------|----------|------|
| Child name | Yes | Only true gate — good |
| Age, region, trait, category | No (defaults) | Good — keep minimal |

**Implemented:** `story_started` / `story_generated` server events, name input `autoFocus` + `enterKeyHint="go"`.

---

## 6. Analytics (Implemented)

### Supabase table: `analytics_events` (migration `021`)

Events (client + server):

- `homepage_view`, `cta_click`, `story_started`, `story_generated`
- `signup_started`, `signup_completed`
- `checkout_started`, `subscription_started`, `subscription_cancelled`

**Client:** `POST /api/analytics/event` + Vercel Analytics dual-write (`lib/analytics.ts`)  
**Server:** `lib/serverAnalytics.ts` in generate-story, checkout, Stripe webhook

---

## 7. Admin Stats Endpoint

```bash
curl -s -H "x-admin-secret: YOUR_SECRET" https://teretstories.com/api/admin/stats | jq
```

Returns: `total_profiles`, `profiles_last_24h`, `profiles_last_7d`, `stories_last_24h`, `stories_last_7d`, `premium_subscribers`, `signup_conversion_rate`, `story_completion_rate`, `subscriber_conversion_rate`, `country_breakdown`, `device_breakdown`, `funnel_7d`.

Requires migrations **021** + **022** on Supabase.

---

## 8. Database

| Table | Notes |
|-------|-------|
| `profiles` | Added indexes on `created_at`, `subscription_status`, `signup_country` (022) |
| `analytics_events` | New (021) |
| `stories` | Existing `created_at` index |
| `subscriptions` | OK |
| `global_daily_stats` | Used for generation counts fallback |

No unused tables removed (safe audit only).

---

## 9. Stripe

| Item | Status |
|------|--------|
| Checkout POST `/api/create-checkout-session` | **Fixed** `returnTo` + `cancel_url` |
| Webhook premium sync | OK |
| `subscription_started` / `cancelled` events | **Added** |
| Duplicate GET checkout route | Still exists — low priority remove |
| Failed payment handling | Relies on Stripe emails + portal |

---

## 10. SEO (Implemented)

- `app/robots.ts`, `app/sitemap.ts`
- Open Graph + Twitter cards + canonical + JSON-LD in `app/layout.tsx`
- `metadataBase` for absolute OG URLs

---

## 11. Performance

| Item | Action |
|------|--------|
| Homepage fully client-rendered | Future: split server hero shell |
| Bundle | No change this pass |
| Images | Icons only — OK |
| API | Analytics insert is async/non-blocking |

---

## 12. Revenue Recommendations (by impact)

1. **High:** After 1st free story, offer “save to library” only after signup (not premium) — separates signup from paywall.
2. **High:** Ethiopia: emphasize free full access in hero for ET geo (done).
3. **High:** Diaspora: $4.99/mo trial (7-day) in Stripe — not implemented (needs product decision).
4. **Medium:** Annual plan at discount.
5. **Medium:** Email drip for unconfirmed signups.
6. **Low:** Remove duplicate Stripe checkout route.

---

## 13. Quick Wins

### 30 minutes (done this pass)
- Server analytics + admin stats ✓
- Stripe cancel URL fix ✓
- SEO robots/sitemap/metadata ✓
- Form autoFocus ✓

### 2 hours
- Default homepage language to Amharic for ET geo cookie
- Move QuickStoryForm name field into hero (single-screen mobile)
- Show “1 free story tonight” badge near CTA

### 1 day
- Guest story save to account on signup (merge localStorage)
- Server-rendered hero HTML for SEO
- Email confirmation bypass for Google-only funnel

### 1 week
- A/B test headlines via feature flag
- Onboarding wizard (child name → first story in 2 taps)
- Annual Stripe price + trial

---

## 14. Files Changed

| File | Change |
|------|--------|
| `supabase/migrations/021_analytics_events.sql` | Analytics table |
| `supabase/migrations/022_performance_indexes.sql` | Profile indexes |
| `lib/analyticsEvents.ts` | Event constants |
| `lib/serverAnalytics.ts` | Server insert helper |
| `lib/sessionId.ts` | Session ID for funnel |
| `lib/analytics.ts` | Dual Vercel + Supabase tracking |
| `app/api/analytics/event/route.ts` | Client event ingestion |
| `app/api/admin/stats/route.ts` | Enhanced JSON stats |
| `app/api/generate-story/route.ts` | Server `story_generated` |
| `app/api/create-checkout-session/route.ts` | returnTo, cancel URL, checkout event |
| `app/api/stripe/webhook/route.ts` | Subscription events |
| `app/page.tsx` | homepage_view, story_started |
| `app/account/page.tsx` | signup_started tracking |
| `app/layout.tsx` | SEO metadata + JSON-LD |
| `app/robots.ts`, `app/sitemap.ts` | SEO routes |
| `components/QuickStoryForm.tsx` | Mobile form UX |
| `.env.example` | Analytics note |
| `CONVERSION_AUDIT.md` | This report |

---

## Highest-Impact Next Steps

1. **Run migrations 021 + 022** on Supabase production.
2. **Watch `/api/admin/stats`** for 7 days — tune Instagram ads to story_started rate.
3. **Let guests save 1 story after signup** (not premium) — biggest signup lever.
4. **Amharic-first homepage** for ET visitors (cookie `teret_country=ET`).
5. **Stripe 7-day trial** for diaspora ad campaigns.
