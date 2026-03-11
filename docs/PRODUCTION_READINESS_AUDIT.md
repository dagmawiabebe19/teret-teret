# Teret-Teret Production Readiness Audit

**Date:** 2025-03-10  
**Scope:** Full app audit with focus on Stripe $4.99/month subscription, sign-up/sign-in/account flow, and production polish.

---

## 1. Executive summary

### Overall production-readiness score: **7.5 / 10**

The app is in good shape for a soft launch: core flows (story generation, free limits, auth, paywall, checkout, webhook) are implemented and secured. The audit found and fixed several bugs and gaps that could have caused broken states or confusion. Remaining work is mostly polish, i18n completeness, and external configuration.

### Biggest risks found (and addressed)

1. **Generate-story error handling** – On non-402 errors (e.g. 500), the code fell through and tried to render a “story” with empty data and briefly switched to the story screen. **Fixed:** All `!res.ok` paths now return after setting error state; no fall-through to success path.
2. **Account post-checkout retry** – When returning with `success=1`, `refreshProfile()` could be called before `user` was set, and the retry interval captured a stale `refreshProfile` (with `user === null`), so premium state never updated. **Fixed:** `refreshProfile` always returns a `Promise`; retry interval uses a ref to the latest `refreshProfile` so polling works once user is loaded.
3. **Stripe portal with missing admin** – If `createAdminClient()` returned `null`, `admin?.from("subscriptions").select(...)` led to calling `.select` on `undefined` and threw. **Fixed:** Explicit check for `!admin` and redirect to account.
4. **Webhook subscription status** – Only `active` was treated as premium; Stripe can send `trialing`. **Fixed:** `active` or `trialing` now set premium.

### Biggest wins

- **Secrets:** No client-side use of `STRIPE_SECRET_KEY` or `ANTHROPIC_API_KEY`; only `NEXT_PUBLIC_*` and server-only env are used.
- **Stripe flow:** Checkout session, success/cancel URLs, metadata, and 401/503 handling are correct; webhook covers the needed events.
- **Auth:** Supabase client is gated by `isAuthConfigured()`; unconfigured auth shows a clear message instead of broken forms.
- **Rolling 24h usage:** Implemented and used consistently in generate-story and usage API; premium bypass is clear.

---

## 2. Stripe audit

### What works

- **POST /api/create-checkout-session:** Uses `STRIPE_SECRET_KEY` and `STRIPE_PRICE_ID` server-side only. Requires auth; returns 401 with `redirect` to `/account?signin=1` when not signed in. Accepts `returnTo` in body and uses it for cancel URL and for success URL (so post-payment return preserves intent).
- **GET /api/stripe/checkout:** Direct link from account page; redirects to Stripe with correct success/cancel URLs; signed-out users sent to `/account?signin=1`.
- **GET /api/stripe/portal:** Opens Stripe Billing Portal for signed-in users with a `stripe_customer_id`; redirects to account when not configured or no customer.
- **Webhook POST /api/stripe/webhook:** Verifies signature with `STRIPE_WEBHOOK_SECRET`; handles `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`. Updates `subscriptions` and `profiles.subscription_status`. `trialing` and `active` both map to premium.
- **Config GET /api/config:** Exposes only `stripeEnabled` (no secrets).
- **Paywall:** Guest upgrade path redirects to `/account?signin=1&returnTo=...`; signed-in upgrade calls create-checkout-session and redirects to Stripe. 401/503 from API trigger redirect; errors shown in modal.

### What was weak (and fixed)

- Success URL always went to `/account?success=1`; **fixed** to include `returnTo` so “Back to Teret Teret” can take the user to the path they came from (e.g. home).
- Portal could throw when admin client was missing; **fixed** with an explicit null check and redirect.
- Webhook treated only `active` as premium; **fixed** to treat `trialing` as premium.
- Paywall “Coming soon” and account “Subscription coming soon” were hardcoded; **fixed** with `t.paywallSubSoon` and `t.subscriptionComingSoon` (am, en, es).

### What still needs external setup

- **Stripe Dashboard:** Create product/price at $4.99/month; set `STRIPE_PRICE_ID` in env.
- **Stripe Webhooks:** Add endpoint `https://<your-domain>/api/stripe/webhook`; subscribe to `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`; set `STRIPE_WEBHOOK_SECRET` in env.
- **Env:** `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`; optionally `NEXT_PUBLIC_APP_URL` for success/cancel/portal URLs (defaults to `http://localhost:3000`).
- **Billing Portal:** Enable in Stripe Dashboard if you use “Manage subscription”.

---

## 3. Auth/account audit

### What works

- **Auth config:** `isAuthConfigured()` checks `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`; when false, account page shows a clear “auth not configured” message and no broken form.
- **createClient():** Returns `null` when env is missing; callers handle null.
- **Email/password:** Sign-in and sign-up with friendly error mapping (invalid login, weak password, duplicate).
- **Google OAuth:** Uses Supabase `signInWithOAuth`; redirectTo supports return path: when `returnTo` is present and safe, redirect goes to `/auth/callback?next=<path>` so after sign-in the user lands on the intended page.
- **Auth callback:** Exchanges code for session; redirects to `next` query param (default `/`) or `/account?error=auth` on failure.
- **Account page:** Shows loading until user is resolved; signed-in state shows email, progress, subscription (Free/Premium), upgrade or manage link; success/cancel/signin query params show appropriate messages; post-checkout retry uses ref so it works when user loads after success=1.

### What was weak (and fixed)

- **Post-checkout retry:** When `success=1` was present before `user` was set, `refreshProfile()` returned without a promise and the retry interval used a stale closure; **fixed** by returning `Promise.resolve(false)` when `!user?.id` and using `refreshProfileRef.current()` in the interval.
- **Google + returnTo:** After paywall guest flow, user went to account; “Back to Teret Teret” used returnTo, but post-Google they always landed on account; **fixed** by using `redirectTo: /auth/callback?next=<returnTo>` when returnTo is present so they can land on home (or the path they came from) after OAuth.
- **Subscription “coming soon”:** **Fixed** with `t.subscriptionComingSoon`.

### What still needs external setup

- **Supabase:** Auth enabled; Google (or other) provider configured; Redirect URLs must include:
  - `https://<your-domain>/account`
  - `https://<your-domain>/auth/callback` (and ideally `https://<your-domain>/auth/callback?next=*` or wildcard if supported)
- **Vercel/host:** Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (for webhook and server-side admin).

---

## 4. Full app audit

### Bugs/issues found and fixed

| Issue | Location | Fix |
|-------|----------|-----|
| Generate-story fall-through on error | `app/page.tsx` | On `!res.ok`, set error state and always `return`; no success path for non-402. |
| refreshProfile not always a Promise | `app/account/page.tsx` | Return `Promise.resolve(false)` when `!user?.id`. |
| Stale refreshProfile in success retry | `app/account/page.tsx` | Use `refreshProfileRef.current()` in interval so latest `refreshProfile` (with user) is used. |
| Portal crash when admin is null | `app/api/stripe/portal/route.ts` | Check `!admin` and redirect to account before using admin. |
| Webhook ignores trialing | `app/api/stripe/webhook/route.ts` | Treat `trialing` and `active` as premium. |
| Success URL dropped returnTo | `app/api/create-checkout-session/route.ts` | Append `&returnTo=<path>` to success_url. |
| Hardcoded “Coming soon” / “Subscription coming soon” | PaywallModal, account page | Use `t.paywallSubSoon`, `t.subscriptionComingSoon`. |

### Remaining improvements (non-blocking)

- **i18n:** Account page still has hardcoded “Sign up”, “Sign in”, “Create an account”, “Already have an account? Sign in”, “— or sign in with email —”, “Back to Teret Teret”, “Email”, “Password”. Consider moving to `lib/constants.ts` and PRODUCT_COPY for full am/en/es.
- **Paywall conversion:** Optional: add a short trust line (e.g. “Cancel anytime” or “Secure payment”) and ensure $4.99/month is visible (already in CTA).
- **Error messages:** Some generic strings (“Save failed”, “Export failed”, “Try again”) could be translation keys for consistency.
- **Mobile:** Account and paywall already use responsive classes; no critical layout bugs found.

### Security

- **ANTHROPIC_API_KEY:** Only read in `app/api/generate-story/route.ts` (server). Not exposed to client.
- **STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET:** Only in API routes (server). Not exposed.
- **SUPABASE_SERVICE_ROLE_KEY:** Only in `lib/supabase/admin.ts` (server). Not exposed.
- **NEXT_PUBLIC_*:** Only `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_APP_URL` used; appropriate for client or public URLs.
- **returnTo:** Validated as same-origin path (starts with `/`, not `//`) before use in redirect/link.

---

## 5. Files changed

- `app/page.tsx` – Generate-story error handling: no fall-through to success path on `!res.ok`.
- `app/account/page.tsx` – refreshProfile always returns Promise; ref for retry interval; Google redirectTo uses `/auth/callback?next=` when returnTo present; subscription “coming soon” uses `t.subscriptionComingSoon`.
- `app/api/stripe/webhook/route.ts` – Treat `trialing` as premium.
- `app/api/stripe/portal/route.ts` – Null check for admin client before using it.
- `app/api/create-checkout-session/route.ts` – Success URL includes `returnTo` query.
- `components/PaywallModal.tsx` – “Coming soon” uses `t.paywallSubSoon`.
- `lib/constants.ts` – Added `subscriptionComingSoon` (am, en, es).
- `docs/PRODUCT_COPY.md` – Documented `subscriptionComingSoon`; updated free limits to “rolling 24h” (no “midnight UTC”).

---

## 6. New translation keys

- **subscriptionComingSoon** (am, en, es) – “Subscription coming soon.” (When Stripe is not configured.)

Existing keys used: `paywallSubSoon` (already present; now used in PaywallModal).

---

## 7. Required env vars

| Variable | Where | Purpose |
|----------|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + server | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Admin operations, webhook |
| `STRIPE_SECRET_KEY` | Server only | Checkout, portal, webhook |
| `STRIPE_PRICE_ID` | Server only | $4.99/month price |
| `STRIPE_WEBHOOK_SECRET` | Server only | Webhook signature verification |
| `NEXT_PUBLIC_APP_URL` | Optional | Success/cancel/portal URLs (default `http://localhost:3000`) |
| `ANTHROPIC_API_KEY` | Server only | Story generation |

---

## 8. Manual dashboard setup

### Stripe

1. Create a Product (e.g. “Teret Premium”) and a recurring Price $4.99/month; copy Price ID → `STRIPE_PRICE_ID`.
2. Webhooks: Add endpoint `https://<domain>/api/stripe/webhook`; events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`; copy signing secret → `STRIPE_WEBHOOK_SECRET`.
3. (Optional) Enable and configure Customer Billing Portal for “Manage subscription”.

### Supabase

1. Auth → URL Configuration: Add Redirect URLs for production (and localhost):  
   - `https://<domain>/account`  
   - `https://<domain>/auth/callback`  
   (Wildcard or `https://<domain>/auth/callback?next=*` if you use returnTo after OAuth.)
2. Auth → Providers: Enable Google (or others); set Client ID/Secret.
3. Ensure RLS and triggers (e.g. `handle_new_user`) are applied from migrations.

### Vercel (or host)

1. Set all env vars from §7 (no secrets in client-exposed code).
2. For Stripe webhook, use production URL in Stripe Dashboard (e.g. `https://yourapp.vercel.app/api/stripe/webhook`).

---

## 9. Final recommendation

### Is Teret-Teret ready for real users?

**Yes, for a soft launch**, provided:

- Stripe and Supabase are configured as above.
- You accept that a few account strings are still English-only until you add more translation keys.

### Top 3 things left (if you want to go from 7.5 → 9)

1. **Finish account page i18n** – Move “Sign up”, “Sign in”, “Create an account”, “Back to Teret Teret”, “Email”, “Password”, and “— or sign in with email —” into constants (am, en, es) and use `lang`/locale so the account page is fully translatable.
2. **Stripe test run** – Do a full test: sign in → upgrade → pay with test card → confirm webhook updates profile → see premium on account and home; cancel or manage subscription via portal.
3. **Auth callback in redirect allowlist** – Ensure Supabase redirect URLs include the exact callback URL you use with `?next=` (or a wildcard) so returnTo-after-Google works in production.

---

*Audit and fixes completed. No intentional changes to story generation, Daily Teret, free limits, rolling 24h window, favorites, progress, sharing, Google sign-in, or translation architecture.*
