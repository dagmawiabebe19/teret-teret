# Phone OTP Authentication Audit — NalaDate

**Audit date:** 2026-06-11  
**Repository audited:** `/Users/dagmawiabebe/Teret-Teret` (remote: `dagmawiabebe19/teret-teret`)  
**Auditor:** Automated codebase scan (read-only, no code changes)

---

## Executive summary

**This repository is Teret Stories (children's bedtime story app), not NalaDate.**

No Ethiopian phone OTP authentication flow exists in this codebase. There is no sign-in page with phone input, no OTP verification UI, no Africa's Talking integration, and no `supabase/functions/` Edge Functions directory. Authentication today is **email/password** and **Google OAuth** only, on `/account`.

**Launch verdict for phone OTP today: NOT SHIPPABLE** — the entire feature is absent. If NalaDate lives in a different repo, re-run this audit against that project.

---

## 1. Code audit

### 1.1 Supabase Edge Function — Africa's Talking SMS hook

| Check | Status | Finding |
|-------|--------|---------|
| Function exists at `supabase/functions/send-sms-hook/` | ❌ **Missing** | `supabase/` contains only `migrations/` — no `functions/` directory |
| Syntactically valid hook code | ❌ **N/A** | No hook file found |
| Uses `AFRICASTALKING_USERNAME` + `AFRICASTALKING_API_KEY` | ❌ **N/A** | No references anywhere in repo |

**Evidence:** `glob supabase/functions/**` → 0 files. `grep -ri africastalking\|send-sms` → no matches.

---

### 1.2 Phone auth UI component

| Check | Status | Finding |
|-------|--------|---------|
| Sign-in page with phone as primary option | ❌ **Missing** | Auth UI is `app/account/page.tsx` — email + password fields only |
| Ethiopian numbers (+251) supported | ❌ **Missing** | No phone input, no `+251` handling |
| Primary auth method is phone | ❌ **No** | Primary methods: Google OAuth button, then email/password |

**What exists instead:**

- `app/account/page.tsx` — `signInWithPassword`, `signUp`, `signInWithOAuth({ provider: "google" })`
- Redirect after OAuth: `app/auth/callback/route.ts` → `/account` (or `?next=` param)
- No `/sign-in`, `/login`, or `/discover` routes

---

### 1.3 OTP verification screen

| Check | Status | Finding |
|-------|--------|---------|
| 6-digit code input UI | ❌ **Missing** | No OTP input component |
| Submits to Supabase Auth | ❌ **Missing** | No `verifyOtp` or `signInWithOtp` calls |

**Evidence:** `grep signInWithOtp\|verifyOtp\|signInWithPhone` → 0 matches in `.ts`/`.tsx` files.

---

### 1.4 Country code selector

| Check | Status | Finding |
|-------|--------|---------|
| Defaults to +251 (Ethiopia) | ❌ **Missing** | No country code selector component |
| Other African codes supported | ❌ **Missing** | — |

---

### 1.5 Phone number validation

| Check | Status | Finding |
|-------|--------|---------|
| Format validation before send | ❌ **Missing** | No phone validation logic |
| E.164 normalization | ❌ **Missing** | No E.164 utilities |

---

### 1.6 Resend OTP logic

| Check | Status | Finding |
|-------|--------|---------|
| "Didn't receive code" flow | ❌ **Missing** | — |
| 60-second cooldown | ❌ **Missing** | — |

---

### 1.7 Rate limiting (OTP-specific)

| Check | Status | Finding |
|-------|--------|---------|
| Max 3 OTP sends per number per hour | ❌ **Missing** | — |

**What exists instead:** `lib/rateLimit.ts` limits **story generation** API calls (3/hour guests, 10/hour users per IP) via `rate_limits` table — unrelated to OTP/SMS.

---

### 1.8 Profile creation after OTP

| Check | Status | Finding |
|-------|--------|---------|
| Profile row created on verify | ⚠️ **Partial** | Trigger exists but is **email-based**, not phone |
| Phone as unique identifier | ❌ **No** | `profiles` has `id` (uuid) + `email` only — no `phone` column |

**Schema (`supabase/migrations/001_initial.sql`):**

```sql
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text,
  subscription_status text DEFAULT 'free',
  ...
);

-- Trigger on auth.users INSERT:
INSERT INTO public.profiles (id, email) VALUES (NEW.id, NEW.email);
```

Phone-auth users would need `profiles.phone` (or rely on `auth.users.phone`) and trigger updates to populate it. None of that exists.

---

## 2. Configuration audit

Dashboard settings cannot be verified from code alone. Based on what this repo expects and what's missing:

### 2.1 Supabase Auth dashboard (cannot verify — checklist for manual review)

| Setting | Expected for phone OTP | Status in this repo |
|---------|------------------------|---------------------|
| Phone provider enabled | Required | ❌ No client code to use it |
| Send SMS Hook → Edge Function URL | Required | ❌ No Edge Function deployed from this repo |
| OTP expiry (~10 min) | Recommended | ⚠️ Unknown — verify in Supabase dashboard |
| Africa's Talking sender ID | Required | ❌ Not referenced in code |

### 2.2 Environment variables

**Required for NalaDate phone OTP (not present in `.env.example`):**

| Variable | Purpose | In `.env.example`? |
|----------|---------|-------------------|
| `AFRICASTALKING_USERNAME` | SMS API auth | ❌ No |
| `AFRICASTALKING_API_KEY` | SMS API auth | ❌ No |
| `AFRICASTALKING_SENDER_ID` | SMS sender name | ❌ No |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase client | ✅ Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase client | ✅ Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Server/admin ops | ✅ Yes |

**What `.env.example` actually documents:** Supabase, Anthropic, Azure Speech, ElevenLabs, Stripe, `NEXT_PUBLIC_APP_URL` — all for Teret Stories story/TTS/billing features.

**Vercel env vars for phone OTP:** None of the Africa's Talking vars are documented or used. Supabase SMS hook secrets are typically set in **Supabase Edge Function secrets** (not Vercel), unless the hook is proxied through a Next.js API route (not implemented here).

---

## 3. End-to-end test

### 3.1 Local / production test (not possible in this repo)

| Step | Result |
|------|--------|
| Send test OTP from sign-in page | ❌ **Cannot test** — no phone sign-in UI |
| SMS arrives within 30s | ❌ **Cannot test** — no SMS integration |
| OTP creates Supabase auth user | ❌ **Cannot test** |
| Profile row created | ⚠️ Would work for **email/OAuth** signups only (existing trigger) |
| User redirected to home/discover | ❌ **N/A** — no discover screen; post-auth default is `/account` |

### 3.2 How to test (once NalaDate phone auth is built)

1. **Supabase:** Enable Phone provider → configure Send SMS Hook URL → deploy `send-sms-hook` Edge Function with Africa's Talking secrets.
2. **Deploy** app with phone sign-in UI calling `supabase.auth.signInWithOtp({ phone: '+2519XXXXXXXX' })`.
3. Open production URL (not localhost — Supabase SMS hooks don't run against local dev without tunneling).
4. Enter a real Ethiopian mobile number in E.164 format.
5. DevTools → Network: confirm `POST` to Supabase auth endpoint succeeds; Supabase logs → Auth → check SMS hook invocation.
6. Africa's Talking dashboard → SMS logs: confirm delivery.
7. Enter 6-digit OTP via `supabase.auth.verifyOtp({ phone, token, type: 'sms' })`.
8. Confirm `auth.users` row with `phone` set; confirm `profiles` row with matching `id` and phone populated.
9. Confirm session cookie and redirect to discover/home.

---

## 4. Known gaps and risks

### 4.1 Africa's Talking fallback if down

| Finding | Risk |
|---------|------|
| ❌ No fallback SMS provider | **High** — single point of failure; users cannot sign in |
| ❌ No user-facing error for SMS delivery failure | Users would see generic auth errors |
| **Recommendation:** Secondary provider (Twilio/MessageBird) or queue + retry; surface "SMS delayed, try again" UI |

### 4.2 Old OTP invalidation on resend

| Finding | Risk |
|---------|------|
| ⚠️ Not implemented in app code | Supabase Auth handles OTP lifecycle server-side when phone auth is enabled — verify Supabase default: new OTP typically invalidates previous |
| ❌ No app-level resend flow | Cannot verify behavior until built |

### 4.3 E.164 phone storage consistency

| Finding | Risk |
|---------|------|
| ❌ No phone storage in schema or app | **High** for launch — must store `+2519XXXXXXXX` consistently |
| `profiles.email` is current identifier | Phone users would have `email = null` unless trigger updated |

### 4.4 Existing user vs new signup

| Finding | Risk |
|---------|------|
| ❌ No phone auth flow | Supabase `signInWithOtp` treats sign-in and sign-up the same (creates user if new) — but UI must not confuse users |
| Current app: separate sign-up toggle for email | Phone OTP should use single flow: "Enter your number" |

### 4.5 Test code / hardcoded numbers

| Finding | Risk |
|---------|------|
| ✅ No hardcoded test phone numbers found | Safe for this dimension |
| ✅ No `+251` test bypass in code | — |
| ⚠️ `app/api/debug/route.ts` exists | Review before production — ensure disabled or auth-gated on NalaDate |

### 4.6 SMS send logging for debugging

| Finding | Risk |
|---------|------|
| ❌ No SMS send logging | Cannot debug delivery failures |
| ❌ No Edge Function = no hook logs in Supabase | **Recommendation:** Log phone (masked), timestamp, Africa's Talking response ID, error codes in Edge Function + Supabase `sms_logs` table |

### 4.7 Additional risks for Teret-Teret (if audit was meant for wrong repo)

- Opening NalaDate checklist against Teret will not unblock phone auth — wrong codebase entirely.
- Teret auth is production-ready for email/Google only; no phone work was started.

---

## 5. Current auth inventory (what actually ships in this repo)

For reference, authentication that **does** exist:

| Component | Path | Method |
|-----------|------|--------|
| Account / sign-in page | `app/account/page.tsx` | Email + password, Google OAuth |
| OAuth callback | `app/auth/callback/route.ts` | Code exchange → redirect |
| Profile auto-create | `supabase/migrations/001_initial.sql` | `handle_new_user()` on `auth.users` INSERT |
| Supabase client | `lib/supabase/client.ts`, `server.ts`, `admin.ts` | Standard SSR client |
| Rate limiting | `lib/rateLimit.ts` | Story generation only (IP-based) |

---

## Before launching today

Numbered must-fix items to ship Ethiopian phone OTP safely. **All are currently open.**

1. **Open the correct repository** — Confirm NalaDate source code is in the workspace; this audit found Teret Stories instead.
2. **Implement `supabase/functions/send-sms-hook/`** — Africa's Talking integration with `AFRICASTALKING_USERNAME`, `AFRICASTALKING_API_KEY`, error handling, and structured logging.
3. **Enable Phone provider in Supabase** — Dashboard → Authentication → Providers → Phone → ON.
4. **Configure Send SMS Hook URL** — Point to deployed Edge Function; redeploy after enabling.
5. **Set Edge Function secrets** — `AFRICASTALKING_USERNAME`, `AFRICASTALKING_API_KEY`, sender ID; verify Africa's Talking account is funded and sender ID approved for Ethiopia.
6. **Build phone sign-in UI** — Phone input as primary auth; default country +251; E.164 normalization before API call.
7. **Build OTP verification screen** — 6-digit input; `verifyOtp`; loading and error states.
8. **Implement resend with 60s cooldown** — "Didn't receive code?" with client timer + server-side rate limit.
9. **Implement OTP rate limiting** — Max 3 sends per phone per hour (Supabase hook and/or `rate_limits` table keyed by phone hash).
10. **Extend `profiles` schema** — Add `phone text UNIQUE`; update `handle_new_user()` to set phone from `auth.users.phone`.
11. **Post-verify redirect** — Route to home/discover (not `/account` unless that's intentional for NalaDate).
12. **Document env vars** — Add Africa's Talking vars to `.env.example`; document Supabase secrets vs Vercel vars.
13. **End-to-end test on production** — Real +251 number; confirm SMS <30s; confirm user + profile created; confirm session persists.
14. **Remove or gate debug endpoints** — Ensure no test bypasses ship to production.
15. **Define SMS failure UX** — Message when Africa's Talking is down; optional backup provider before marketing launch.
16. **Set OTP expiry** — Supabase dashboard → 10 minutes recommended; document for support team.
17. **Privacy/compliance** — Phone numbers are PII; ensure privacy policy covers SMS OTP; log retention policy for SMS logs.

---

## Appendix: Files searched

```
app/account/page.tsx          — email/password + Google (no phone)
app/auth/callback/route.ts    — OAuth only
lib/supabase/*.ts             — standard clients
lib/rateLimit.ts              — story API rate limits only
supabase/migrations/*.sql     — profiles(email), no phone column
supabase/functions/           — DOES NOT EXIST
.env.example                  — no Africa's Talking vars
```

---

*Report generated without code modifications. Re-audit after switching to the NalaDate repository or after implementing phone OTP in this project.*
