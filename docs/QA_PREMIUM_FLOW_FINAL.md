# Final QA: Premium Subscription Flow

**Date:** 2025-03-10

## 1. Flows verified (code-level)

### Guest flow
- **Generate stories:** `generateStory` uses `usage?.remainingStoriesToday ?? 0`; guest usage from `/api/usage` (IP-based).
- **3-story limit:** When `!isPremium && remaining <= 0 && usage !== null`, `setShowPaywall(true)`.
- **Paywall:** Renders when `showPaywall`; shows real premium CTA when `stripeEnabled` (from `/api/config`, refetched when paywall opens if false).
- **Guest upgrade click:** `handleUpgrade` sees `isGuest` → redirect to `/account?signin=1&returnTo=${encodeURIComponent(pathname)}`. No "Coming soon" when Stripe configured.

### Signed-in free flow
- **Limit:** Same check; paywall opens.
- **Upgrade click:** `handleUpgrade` calls `POST /api/create-checkout-session` with `returnTo`, then `window.location.href = data.url` to Stripe Checkout.
- **401/503:** Modal redirects to `data.redirect` (sign-in or account).

### Post-checkout flow
- **Return URL:** `success_url` includes `returnTo` → `/account?success=1&returnTo=...`.
- **Account page:** On `success=1`, sets welcome message, calls `refreshProfile()` (ref so retry uses latest), then polls every 2s up to 5 times; shows "premium activating" until premium.
- **Premium state:** From `GET /api/profile` → `subscriptionStatus`; account shows Premium, Unlimited stories, Manage subscription.
- **Home after return:** Navigate back uses `returnTo`; home remounts and runs `refreshUsage()` + profile fetch. **Added:** `visibilitychange` listener so switching back to the tab also refreshes usage (no stale "free" after upgrade in another tab).

### Premium flow
- **Not blocked:** `isPremium = subscriptionStatus === "premium"`; paywall only when `!isPremium && remaining <= 0 && usage !== null`.
- **Badge:** `subscriptionStatus === "premium"` → `t.unlimitedStories`.
- **Account:** Shows Premium, "Unlimited stories", Manage subscription link.

### Stripe/sync
- **success_url / cancel_url:** Set in create-checkout-session; success includes `returnTo`; cancel uses `returnTo` (full URL).
- **returnTo:** Validated as path starting with `/` and not `//` in create-checkout-session body and account page link; **added** same validation in auth callback for `next` param.
- **Webhook:** checkout.session.completed + subscription.updated/deleted update `profiles.subscription_status`; account retry handles delay.
- **Stale state:** Visibility refresh on home ensures tab switch after upgrade shows premium.

### UI/UX
- **Paywall:** Primary = Upgrade CTA, secondary = Maybe later; guest also sees signInToUpgrade copy.
- **"Coming soon":** Only when `!stripeEnabled`; copy from `t.paywallSubSoon`.
- **Account:** Uses `t.subscriptionComingSoon` when Stripe not configured; success/cancel/signin messages from constants.

---

## 2. Issues found and fixes

| Issue | Fix |
|-------|-----|
| Auth callback could redirect to unsafe `next` (e.g. `//evil.com`) | Validate `next`: use only if it starts with `/` and does not start with `//`; otherwise fallback to `/`. |
| Returning to home tab after upgrading in another tab could show stale "free" | Add `visibilitychange` listener on home page; when tab becomes visible, call `refreshUsage()`. |

---

## 3. Files changed

- **`app/auth/callback/route.ts`** – Validate `next` query param before redirect (safe path only).
- **`app/page.tsx`** – Add `visibilitychange` listener to refresh usage when tab becomes visible.

---

## 4. Production readiness

**Yes.** With Stripe and Supabase configured (env vars, webhook, redirect URLs), the full premium flow is production-ready:

- Guest → limit → paywall → sign-in path with returnTo.
- Signed-in free → limit → paywall → checkout → return with success=1 → profile refresh and retry.
- Premium users never see paywall; badge and account show premium state.
- returnTo is preserved and validated; auth callback and account Back link are safe.
- Stale client state is mitigated by visibility refresh and account retry.

---

## 5. Remaining manual setup

- **Stripe:** Create $4.99/month price; set `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`; add webhook endpoint for `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`; enable Billing Portal if using Manage subscription.
- **Supabase:** Set redirect URLs (e.g. `https://<domain>/account`, `https://<domain>/auth/callback`); enable Google (or other) provider.
- **Vercel:** Set all env vars; ensure `NEXT_PUBLIC_APP_URL` is production URL for Stripe success/cancel/portal URLs.
