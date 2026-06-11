# Restore NalaDate database after Supabase project deletion

Your Supabase project was wiped. This guide rebuilds **everything** the app needs from a single SQL file plus dashboard configuration.

---

## Overview

| Step | What | Time |
|------|------|------|
| 1 | Run `000_fresh_install.sql` | ~30 sec |
| 2 | Update Vercel env vars | 5 min |
| 3 | Configure Auth (phone, email, Google, hooks) | 10 min |
| 4 | Deploy Edge Function `send-sms-hook` | 5 min |
| 5 | Create storage buckets (if SQL step missed them) | 2 min |
| 6 | Smoke test | 10 min |

**Do not** run the old migrations `001`–`019` individually after `000_fresh_install.sql` — the fresh install file already includes their final state.

---

## Step 1 — Run the consolidated migration

1. Open your **new** Supabase project → **SQL Editor**
2. Click **New query**
3. Paste the entire contents of:

   `supabase/migrations/000_fresh_install.sql`

4. Click **Run**
5. Confirm success (no red errors)

### What this creates

**Tables**

| Table | Purpose |
|-------|---------|
| `profiles` | User profile (phone, email, auth_method, Teret progress, NalaDate fields) |
| `stories` | Teret saved/generated stories |
| `usage_tracking` | Free-tier story generation limits |
| `subscriptions` | Stripe subscription state |
| `child_profiles` | Teret premium child profiles |
| `rate_limits` | IP-based API rate limits |
| `global_daily_stats` | Global daily story cap (500/day) |
| `global_sms_stats` | Global daily SMS cap (50/day) |
| `otp_rate_limits` | Per-phone / per-IP OTP limits |
| `otp_attempt_logs` | OTP send/verify audit log |
| `otp_verify_failures` | Wrong-code soft lock tracking |
| `swipes` | NalaDate like/pass |
| `matches` | Mutual matches |
| `conversations` | Chat threads per match |
| `messages` | Chat messages |

**Functions**

- `handle_new_user()` — trigger on `auth.users` INSERT
- `increment_usage(uuid)` — story generation counter
- `reserve_global_daily_story_slot(integer)` — story cap
- `reserve_global_daily_sms_slot(integer)` — SMS cap
- `check_phone_email_conflict(text)` — block phone on email accounts
- `cleanup_otp_rate_limits()` — daily cleanup

**Trigger**

- `on_auth_user_created` on `auth.users` → calls `handle_new_user()`

**Storage buckets**

- `tts-cache` — Teret TTS audio (public read)
- `profile-photos` — NalaDate profile images (public read, user-scoped upload)

---

## Step 2 — Update Vercel environment variables

In **Vercel → Project → Settings → Environment Variables**, set these for **Production** (and Preview if you use preview deploys):

### Required (app won't work without these)

| Variable | Where to get it |
|----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → `service_role` key (secret) |

### Phone OTP & admin

| Variable | Purpose |
|----------|---------|
| `ADMIN_SECRET` | Protects `GET /api/admin/sms-stats` |
| `DAILY_SMS_CAP` | Optional override (default 50); must match Edge Function secret |

### Teret Stories (if you use those features)

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | Story generation |
| `ELEVENLABS_API_KEY` | English/Spanish TTS |
| `AZURE_SPEECH_KEY` | Amharic TTS |
| `AZURE_SPEECH_REGION` | Azure region |
| `STRIPE_SECRET_KEY` | Subscriptions |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Checkout |
| `STRIPE_PRICE_ID` | Premium price |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhooks |
| `NEXT_PUBLIC_APP_URL` | Redirect URLs (e.g. `https://naladate.com`) |

After updating env vars, **redeploy** Vercel (Deployments → … → Redeploy).

---

## Step 3 — Configure Supabase Auth

### Phone provider (primary for NalaDate)

1. **Authentication → Providers → Phone** → Enable
2. **OTP expiry:** 600 seconds (10 minutes)

### Send SMS Hook

1. **Authentication → Hooks → Send SMS** → Enable
2. Type: **HTTPS**
3. URL: `https://<project-ref>.supabase.co/functions/v1/send-sms-hook`
4. Generate hook secret → copy `v1,whsec_...` (used in Step 4)

### Email provider

1. **Authentication → Providers → Email** → Enable (for `/account` email sign-in)
2. Configure SMTP or use Supabase default for testing

### Google OAuth

1. **Authentication → Providers → Google** → Enable
2. Add Google Cloud OAuth client ID + secret
3. Add redirect URL: `https://<project-ref>.supabase.co/auth/v1/callback`
4. In Google Console, authorized redirect URIs must include the above

### Site URL & redirects

1. **Authentication → URL Configuration**
2. **Site URL:** `https://naladate.com` (or your domain)
3. **Redirect URLs:** add:
   - `https://naladate.com/auth/callback`
   - `https://naladate.com/**` (or list `/discover`, `/account`, `/onboarding`)

---

## Step 4 — Deploy Send SMS Edge Function

From your machine (with Supabase CLI):

```bash
supabase login
supabase link --project-ref <your-project-ref>

supabase secrets set \
  SEND_SMS_HOOK_SECRET="v1,whsec_YOUR_HOOK_SECRET" \
  AFRICASTALKING_USERNAME="your_username" \
  AFRICASTALKING_API_KEY="your_api_key" \
  AFRICASTALKING_SENDER_ID="your_sender_id" \
  DAILY_SMS_CAP="50" \
  SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"

supabase functions deploy send-sms-hook --no-verify-jwt
```

`SUPABASE_URL` is auto-injected on Supabase-hosted functions.

For sandbox testing: add `AFRICASTALKING_SANDBOX=true`.

---

## Step 5 — Storage buckets (manual fallback)

If bucket creation failed in SQL (permissions), create manually:

### `tts-cache`

- Public: **Yes**
- File size limit: 5 MB
- MIME types: `audio/mpeg`, `audio/mp3`
- Policy: public SELECT

### `profile-photos`

- Public: **Yes** (or authenticated-only if you prefer private photos later)
- File size limit: 5 MB
- MIME types: `image/jpeg`, `image/png`, `image/webp`
- Policies:
  - **SELECT:** public (or authenticated)
  - **INSERT/UPDATE/DELETE:** authenticated users, path must start with `{user_id}/`

Upload path convention: `{user_id}/avatar.jpg`

---

## Step 6 — Smoke test

1. **Phone sign-in:** `https://naladate.com/auth/sign-in` → send OTP → verify → lands on `/onboarding` or `/discover`
2. **Email sign-in:** `/account` → email/password still works
3. **Google:** "Or sign in with Google" on `/auth/sign-in`
4. **Profile row:** Supabase → Table Editor → `profiles` → new row with `phone` + `auth_method`
5. **SMS stats:** `curl -H "Authorization: Bearer $ADMIN_SECRET" https://naladate.com/api/admin/sms-stats`
6. **Teret (if used):** generate a story, confirm `usage_tracking` increments

Full checklist: `phone-auth-test-plan.md`

---

## If something fails

### SQL migration errors

| Error | Fix |
|-------|-----|
| `relation already exists` | You ran migrations twice. Drop `public` tables or use a truly fresh project. |
| `permission denied for schema auth` | Run as postgres role in SQL Editor (default). `handle_new_user` trigger needs auth schema access. |
| `storage.buckets` insert fails | Create buckets manually in **Storage** UI (Step 5). |

### Phone OTP not sending

1. Check Edge Function logs: **Edge Functions → send-sms-hook → Logs**
2. Confirm hook URL matches deployed function URL exactly
3. Confirm `SEND_SMS_HOOK_SECRET` matches Auth hook config
4. Check Africa's Talking balance and sender ID
5. Check `global_sms_stats` — if `sms_sent_count >= 50`, cap is hit (raise `DAILY_SMS_CAP`)

### "Database schema needs migration" in app

A column is missing. Re-run `000_fresh_install.sql` on a clean database, or compare `profiles` / `stories` columns against the migration file.

### Profile not created after sign-up

1. Confirm trigger exists: SQL Editor → `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`
2. Re-run the trigger section from `000_fresh_install.sql`
3. Check **Database → Logs** for trigger errors

### RLS blocking reads/writes

- User-facing tables use `auth.uid()` policies
- OTP / global cap tables are **service_role only** — the app uses `SUPABASE_SERVICE_ROLE_KEY` in API routes
- If service role key is wrong or missing in Vercel, OTP rate limits and admin stats fail open or error

### Stripe subscriptions not updating

1. Confirm `STRIPE_WEBHOOK_SECRET` in Vercel
2. Re-create Stripe webhook endpoint pointing to `https://naladate.com/api/stripe/webhook`
3. `subscriptions` and `profiles.subscription_status` are updated by webhook via service role

### Google OAuth redirect mismatch

Add exact callback URL from Supabase Auth settings to Google Cloud Console authorized redirect URIs.

---

## Dating tables note

`swipes`, `matches`, `conversations`, and `messages` are created with RLS policies but **discover/chat UI is not fully built** in the current codebase. They are ready for when you wire up matching — no extra migration needed.

---

## Related docs

- `supabase-setup.md` — original phone OTP setup (subset of this guide)
- `phone-auth-test-plan.md` — QA checklist
- `phone-auth-audit.md` — architecture audit

---

## Quick reference: file to run

```
supabase/migrations/000_fresh_install.sql
```

One file. One run. Then dashboard + Vercel + Edge Function.
