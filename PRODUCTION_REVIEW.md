# Teret-Teret Production Review

## Top 10 Issues / Risks

| # | Issue | Severity | Status |
|---|--------|----------|--------|
| 1 | usage_tracking row missing + non-atomic increment | **Critical** | Fixed |
| 2 | Stripe subscription.updated/deleted without user_id in metadata | **Critical** | Fixed |
| 3 | Billing period end inconsistent (trigger vs API reset) | **High** | Fixed |
| 4 | Parser fails on lowercase or inline [AM]/[EN]/[ES] | **High** | Fixed |
| 5 | Guest localStorage overwritten when user signs in | **Medium** | Documented |
| 6 | RLS: profiles INSERT uses ON CONFLICT but no unique on id | **Minor** | No change (PK is enough) |
| 7 | Auth callback redirects to same origin (open redirect risk) | **Minor** | Documented |
| 8 | No idempotency key for Stripe checkout.session.completed | **Minor** | Documented |
| 9 | Account page creates new Supabase client on every use | **Minor** | No change |
| 10 | TypeScript: cookie options type in server.ts | **Minor** | No change |

---

## 1. usage_tracking row missing + non-atomic increment — **Critical** (Fixed)

**Risk:** Users created before the trigger or after a trigger failure have no `usage_tracking` row. The limit check returns no row, so `count` is 0 and they can generate; the later update affects 0 rows, so count is never incremented (unlimited free). Also, two concurrent requests can both read the same count and both write count+1, so one generation is not charged.

**Fixes applied:**
- **Ensure row exists:** Before the limit check, upsert `usage_tracking` with `ignoreDuplicates: true` so missing rows get a 0-count row for the current period.
- **Atomic increment:** New migration `002_usage_increment_rpc.sql` adds `increment_usage(uuid)`. The generate-story route calls this RPC after a successful story; if the RPC fails (e.g. migration not run), it falls back to the previous read-then-write update.

**Files changed:** `supabase/migrations/002_usage_increment_rpc.sql`, `app/api/generate-story/route.ts`.

---

## 2. Stripe subscription.updated/deleted without user_id — **Critical** (Fixed)

**Risk:** For `customer.subscription.updated` and `customer.subscription.deleted`, the code used `sub.metadata?.user_id`. Subscriptions created outside our checkout (or before we set metadata) have no `user_id`, so we skip the update and the profile stays out of sync.

**Fix applied:** If `user_id` is missing from the event, look it up from `subscriptions` by `stripe_subscription_id`, then update the profile as before.

**Files changed:** `app/api/stripe/webhook/route.ts`.

---

## 3. Billing period end inconsistent — **High** (Fixed)

**Risk:** The trigger sets `billing_period_end = date_trunc('month', now()) + interval '1 month'` (first day of next month). The generate-story reset used `new Date(year, month + 1, 0)` (last day of current month). So “period end” meant different things and reset logic could be wrong.

**Fix applied:** In generate-story, the reset now uses the first day of the next month for `billing_period_end`, and the “expired?” check uses `storedEnd <= now` so the first moment of the next month is treated as the start of the new period.

**Files changed:** `app/api/generate-story/route.ts`.

---

## 4. Parser and malformed AI output — **High** (Fixed)

**Risk:** Tags like `[am]` or `[EN]` in the middle of a line were not handled; strict `[AM]`/`[EN]`/`[ES]` only. Some model outputs could break parsing.

**Fixes applied:**
- **Case-insensitive tags:** Block detection uses `t.toUpperCase().startsWith("[AM]")` (and [EN]/[ES]) so `[am]`, `[En]`, etc. are recognized.
- **Tag boundaries:** New `normalizeTagBoundaries()` inserts a newline before `[AM]`/`[EN]`/`[ES]` when they appear after non-newline text (e.g. `"text[EN] more"` → `"text\n[EN] more"`), so inline tags still produce separate blocks.

**Files changed:** `lib/parseStory.ts`.

---

## 5. Guest localStorage overwritten on login — **Medium** (Documented)

**Risk:** When a user signs in, the home page fetches `/api/stories` and sets `savedStories` to the API result. Any stories previously saved only in localStorage (guest) are no longer shown and are not automatically saved to the DB.

**Recommendation:** Either document that “Sign in to sync; local-only stories stay in this device until you save again,” or add a one-time flow: if there are localStorage stories and the user just signed in, show a short message and optionally offer “Add my X local stories to my account” (e.g. POST each to `/api/stories`). No code change in this review.

---

## 6. RLS correctness — **Minor** (No change)

**Checked:** Policies are correct: profiles/stories/usage_tracking/subscriptions are scoped to `auth.uid()`. The trigger uses `SECURITY DEFINER` and inserts into `profiles` and `usage_tracking`; `profiles` has a PK on `id`, so `ON CONFLICT (id)` is valid. No change made.

---

## 7. Auth callback redirect — **Minor** (Documented)

**Risk:** Redirect uses `origin` from the request URL. In theory a malicious link could use `?next=https://evil.com` and the redirect could send users to another domain if `origin` were taken from that. In the current code we use `origin` from `new URL(request.url)`, which is the request’s origin (your app), not the `next` param, so we only redirect within the same origin. `next` is path-only (e.g. `/account`). So risk is low; no code change.

---

## 8. Stripe webhook idempotency — **Minor** (Documented)

**Risk:** If Stripe retries the same event, we run the same updates again. Our updates are idempotent (upsert/update by id), so duplicate delivery is safe. We do not dedupe by `event.id`; for stricter idempotency you could store processed event IDs and skip duplicates. Optional improvement.

---

## 9 & 10. Account Supabase client / TypeScript cookie type — **Minor** (No change)

**Risk:** Account page calls `createClient()` in several places; cookie type in server is a generic object. These are acceptable for correctness and maintainability; no change.

---

## Manual Tests to Run

### Supabase RLS
1. **Stories:** As user A, create a story via the app. In Supabase (SQL or Table Editor as user B), try to select/update/delete that story by id — should see no rows or RLS denial.
2. **Usage:** As user A, trigger a generation; check `usage_tracking` has one row for A. As user B, try to update A’s row — should be denied (or 0 rows) with RLS.

### Stripe webhook
3. **Checkout completed:** Run a test checkout; in Stripe Dashboard → Webhooks, confirm the event is sent and returns 200. Check `subscriptions` and `profiles` for that user (premium).
4. **Subscription updated/deleted:** In Stripe, update or cancel the test subscription; confirm webhook runs and `profiles.subscription_status` becomes free when cancelled.
5. **Idempotency:** Send the same `checkout.session.completed` event body twice (e.g. Stripe “Resend”); both should return 200 and the DB should stay consistent (no duplicate rows, same state).

### Free-tier usage
6. **New user (no row):** Create a brand-new user (or delete their `usage_tracking` row). Generate a story; confirm one row is created and `generation_count` is 1.
7. **Limit:** As a free user, generate 3 stories; the 4th should return 402 and show the paywall message.
8. **Period reset:** Manually set `billing_period_end` to yesterday for a free user. Generate again; count should reset to 1 and a new period should be set (first day of next month).
9. **Concurrent requests:** (Optional) As one user, fire two generate requests at once; confirm `generation_count` increases by 2 (atomic increment).

### Parser
10. **Case:** Paste a story that uses `[am]` and `[en]` (lowercase); confirm it parses and displays.
11. **Inline tag:** Paste text like `Hello[EN]World[ES]Mundo` (no newlines before tags); confirm it splits into blocks correctly.

### Guest vs logged-in
12. **Guest:** Without signing in, generate and save 1–2 stories. Confirm they appear under “My Saved Stories” and persist after refresh (localStorage).
13. **Then sign in:** Sign in; confirm saved stories list now shows only DB stories (localStorage list is effectively replaced). Re-open a story that was saved while guest — optional: add a note in UI that “Stories from this device only appear here until you sign in and save.”
14. **Logged-in save:** Signed in, generate and save; confirm the story appears in the list and, after refresh, still loads from the API.

### Account / session
15. **Sign up:** Sign up with email; confirm “Check your email” and (if email confirm is on) that confirming logs you in and redirects correctly.
16. **Auth callback:** Use “Sign in with OAuth” or magic link if configured; confirm redirect to `/` or `next` and that session is set.
17. **Sign out:** Sign out; confirm home page shows guest state (e.g. no account-specific data) and `/account` shows the login form.

### Mobile / accessibility
18. **Reader:** On a phone, open a story and swipe left/right; confirm page changes. Use “tap to continue” and confirm end screen and buttons work.
19. **Form:** On a small viewport, confirm the story form (name, age, trait, region, inspiration dropdown) is usable and the “Tell Me a Story” button is tappable.
20. **Focus / screen reader:** Tab through the form and reader; confirm focus order and that labels (e.g. “Story Inspiration”) are associated with controls. Check that key actions (Generate, Save, Copy) are reachable and announced.

### No regressions
21. **Language switch:** On home and in the reader, switch Amharic / English / Spanish; confirm UI and story text update.
22. **Copy / export / share:** From the story end screen, use Copy, Export .txt, and Share (if available); confirm content is correct and no errors.
23. **Paywall:** Exhaust free tier; confirm paywall modal and that “Subscribe” goes to Stripe (or account if not signed in). “Maybe later” should close the modal.

---

## Summary of Code Changes

- **`supabase/migrations/002_usage_increment_rpc.sql`** — New: `increment_usage(uuid)` and grants.
- **`app/api/generate-story/route.ts`** — Ensure usage row (upsert), consistent billing period (first day of next month), call `increment_usage` RPC with fallback.
- **`app/api/stripe/webhook/route.ts`** — For subscription.updated/deleted, resolve `user_id` from `subscriptions` when not in metadata.
- **`lib/parseStory.ts`** — Case-insensitive tag detection, `normalizeTagBoundaries()`, and use normalized text before extract/repair.

Run the new migration (`002_usage_increment_rpc.sql`) in your Supabase project before relying on the new usage behavior.
