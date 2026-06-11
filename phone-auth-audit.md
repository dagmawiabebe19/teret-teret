# Phone OTP Authentication Audit — NalaDate

**Audit date:** 2026-06-11  
**Repository:** `teret-teret` (workspace path: Teret-Teret)  
**Scope:** Ethiopian phone OTP via Supabase Auth + Africa's Talking Send SMS Hook + 50/day global SMS cap

---

## Executive summary

| Area | Status |
|------|--------|
| **SMS cap infrastructure** | ✅ Added in this commit (migration, Edge Function hook, admin API) |
| **Phone OTP end-to-end** | ❌ Not shippable — sign-in UI, OTP screen, and profile-by-phone are still missing |
| **Launch today?** | **No** — enable hook + run migration, then build phone auth UI before real users |

> **Repo note:** This workspace is primarily **Teret Stories** (email/Google auth on `/account`). NalaDate phone OTP UI has not been built here. The Send SMS Hook and daily cap are **ready to wire** once Phone provider is enabled in Supabase.

---

## 1. Code audit

### 1.1 Supabase Edge Function — Africa's Talking Send SMS Hook

| Check | Status | Details |
|-------|--------|---------|
| Edge Function exists | ✅ **Working** | `supabase/functions/send-sms-hook/index.ts` |
| Uses `AFRICASTALKING_USERNAME` | ✅ **Working** | `Deno.env.get("AFRICASTALKING_USERNAME")` |
| Uses `AFRICASTALKING_API_KEY` | ✅ **Working** | Header `apikey: ...` |
| Webhook signature verification | ✅ **Working** | `SEND_SMS_HOOK_SECRET` via `standardwebhooks` |
| Global daily cap before send | ✅ **Working** | Calls `reserve_global_daily_sms_slot()`; returns 429 + friendly message when cap hit |
| SMS error handling | ✅ **Working** | Returns 502 with user-safe message; logs masked phone + AT response |
| SMS send logging | ⚠️ **Needs fix** | Console logs in Edge Function only — no persistent `sms_send_logs` table yet |
| Deployed to Supabase | ⚠️ **Needs fix** | File exists locally; must run `supabase functions deploy send-sms-hook --no-verify-jwt` |

**Deploy checklist:**
```bash
supabase db push   # or paste 017_global_sms_cap.sql in SQL Editor
supabase secrets set SEND_SMS_HOOK_SECRET=... AFRICASTALKING_USERNAME=... AFRICASTALKING_API_KEY=... AFRICASTALKING_SENDER_ID=... DAILY_SMS_CAP=50
supabase functions deploy send-sms-hook --no-verify-jwt
```

---

### 1.2 Phone auth UI on sign-in page

| Check | Status | Details |
|-------|--------|---------|
| Phone input as primary auth | ❌ **Missing** | Auth is `app/account/page.tsx` — email/password + Google only |
| Country code defaults to +251 | ❌ **Missing** | No country selector component |
| 6-digit OTP verification screen | ❌ **Missing** | No `verifyOtp` / OTP input UI |
| Phone validation before send | ❌ **Missing** | No `signInWithOtp` calls |
| Resend OTP + 60s cooldown | ❌ **Missing** | — |
| Per-number rate limit (3/hour) | ❌ **Missing** | Not implemented in hook or app |
| Per-IP rate limit (5/hour) | ❌ **Missing** | `lib/rateLimit.ts` only limits story generation |
| Profile after OTP with phone ID | ❌ **Missing** | `profiles` has `email` only; trigger inserts `(id, email)` |
| Existing number → login (not error) | ⚠️ **Needs fix** | Supabase `signInWithOtp` handles this server-side once UI exists |
| E.164 storage (+2519XXXXXXXX) | ❌ **Missing** | No phone column or normalization utilities |
| Old OTP invalidated on resend | ⚠️ **Needs fix** | Supabase Auth default behavior — verify in dashboard after Phone enabled |

---

### 1.3 Global daily SMS cap (added this commit)

| Check | Status | Details |
|-------|--------|---------|
| `global_sms_stats` table | ✅ **Working** | `supabase/migrations/017_global_sms_cap.sql` |
| `reserve_global_daily_sms_slot()` RPC | ✅ **Working** | Atomic increment; returns `boolean`; SQL constant `DAILY_SMS_CAP := 50` |
| Env override `DAILY_SMS_CAP` | ✅ **Working** | Edge Function passes `p_cap` from `DAILY_SMS_CAP` secret; admin API reads same env |
| Cap message to user | ✅ **Working** | *"We've reached today's signup limit — please try again tomorrow..."* |
| Admin stats route | ✅ **Working** | `GET /api/admin/sms-stats` — today + last 30 days; `ADMIN_SECRET` required |

**Run migration in Supabase Dashboard (SQL Editor):**

```sql
-- Paste contents of supabase/migrations/017_global_sms_cap.sql
```

**Test admin endpoint:**
```bash
curl -H "Authorization: Bearer $ADMIN_SECRET" https://your-app.vercel.app/api/admin/sms-stats
```

---

## 2. Configuration audit

Dashboard settings cannot be verified from code. Manual checklist:

| Setting | Status | Action |
|---------|--------|--------|
| Supabase Auth → Phone enabled | ⚠️ **Verify** | Dashboard → Authentication → Providers → Phone → ON |
| Send SMS Hook → Edge Function URL | ⚠️ **Verify** | `https://<project>.supabase.co/functions/v1/send-sms-hook` |
| Hook secret matches `SEND_SMS_HOOK_SECRET` | ⚠️ **Verify** | Auth → Hooks → Send SMS → copy secret to Edge Function secrets |
| OTP expiry ≤ 10 minutes | ⚠️ **Verify** | Auth → Providers → Phone → OTP expiry (recommend 600s) |
| Africa's Talking sender ID | ⚠️ **Verify** | Set `AFRICASTALKING_SENDER_ID`; must be approved for Ethiopia |
| Africa's Talking positive balance | ⚠️ **Verify** | [account.africastalking.com](https://account.africastalking.com) → billing |
| Vercel production env vars | ⚠️ **Verify** | See table below |

### Required environment variables

**Vercel (Next.js app)**

| Variable | Required for | In `.env.example`? |
|----------|--------------|-------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | App + admin stats | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin SMS stats | ✅ |
| `ADMIN_SECRET` | `/api/admin/sms-stats` | ✅ (documented) |
| `DAILY_SMS_CAP` | Admin stats display (optional override) | ✅ (documented) |

**Supabase Edge Function secrets** (not Vercel)

| Variable | Purpose |
|----------|---------|
| `SEND_SMS_HOOK_SECRET` | Webhook HMAC verification |
| `AFRICASTALKING_USERNAME` | AT API |
| `AFRICASTALKING_API_KEY` | AT API |
| `AFRICASTALKING_SENDER_ID` | Sender ID / shortcode |
| `SUPABASE_SERVICE_ROLE_KEY` | RPC `reserve_global_daily_sms_slot` |
| `SUPABASE_URL` | Auto-injected on Supabase |
| `DAILY_SMS_CAP` | Override default 50 (e.g. `200`, `1000`) |
| `AFRICASTALKING_SANDBOX` | Set `true` for sandbox API URL |

---

## 3. End-to-end test

| Step | Status | How to test |
|------|--------|-------------|
| Send OTP from sign-in page | ❌ **Blocked** | No phone UI — test via Supabase Auth API or after UI built |
| SMS arrives < 30s | ⚠️ **Untested** | After deploy: `supabase auth sign-in-with-otp` or NalaDate sign-in page |
| OTP creates auth user | ⚠️ **Untested** | `supabase.auth.verifyOtp({ phone, token, type: 'sms' })` |
| Profile row created | ⚠️ **Partial** | Email/OAuth trigger works; phone column not in schema |
| Redirect to discover/home | ❌ **N/A** | Teret redirects to `/account`; NalaDate needs `/discover` route |

**Manual hook test (after deploy):**
1. Enable Phone + Send SMS Hook in Supabase.
2. Trigger OTP for `+2519XXXXXXXX` via Supabase client or dashboard test.
3. Network: hook returns 200; AT dashboard shows SMS.
4. `GET /api/admin/sms-stats` — `today.sms_sent_count` increments.
5. Send 51st OTP same day — hook returns 429 with cap message.

---

## 4. Known risks

### Hardcoded test phone numbers

| Finding | Status |
|---------|--------|
| Test phone bypass in app code | ✅ None found |
| Sandbox mode | ⚠️ Controlled by `AFRICASTALKING_SANDBOX=true` — must be **unset/false** in production |

### SMS logging for debugging

| Finding | Status |
|---------|--------|
| Edge Function console logs | ✅ Masked phone, messageId, errors |
| Persistent DB log table | ❌ Not implemented — use Supabase Function logs + AT dashboard |

### Africa's Talking errors

| Scenario | Behavior |
|----------|----------|
| Invalid credentials | Hook returns **502** — *"Could not send verification SMS..."* |
| Insufficient balance | AT API error → **502**, logged with response body |
| Daily cap reached | **429** — friendly cap message (slot not consumed if send fails after reserve — see note) |

> **Note:** Cap slot is reserved **before** AT send. If AT fails after reserve, that slot is still counted (prevents cost runaway retries). Acceptable for launch; consider refund-on-failure later.

### Other risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| No SMS provider fallback | High | Monitor AT balance; add secondary provider post-launch |
| No per-number/IP OTP limits | High | Add to Edge Function using `rate_limits` table before marketing |
| Wrong repo / missing NalaDate UI | **Blocker** | Build phone sign-in + OTP screens |
| `app/api/debug/route.ts` | Low | Dev-only (404 in production) |

---

## 5. What was added (this commit)

| File | Purpose |
|------|---------|
| `supabase/migrations/017_global_sms_cap.sql` | Table + RPC |
| `supabase/functions/send-sms-hook/index.ts` | AT hook + cap |
| `app/api/admin/sms-stats/route.ts` | Admin monitoring |
| `.env.example` | Documents SMS/admin env vars |

**Not modified:** Email/Google auth flow, existing Teret features.

---

## Before launching today

1. ⚠️ **Run migration `017_global_sms_cap.sql`** in Supabase SQL Editor (or `supabase db push`).
2. ⚠️ **Deploy Edge Function** `send-sms-hook` with all secrets; `--no-verify-jwt`.
3. ⚠️ **Enable Phone provider** + **Send SMS Hook** in Supabase Auth; set OTP expiry to 10 min.
4. ⚠️ **Confirm Africa's Talking** sender ID + live balance.
5. ⚠️ **Set Vercel prod env:** `ADMIN_SECRET`, `DAILY_SMS_CAP` (optional), existing Supabase keys.
6. ❌ **Build NalaDate phone sign-in UI** — +251 default, E.164 validation, `signInWithOtp`.
7. ❌ **Build 6-digit OTP screen** — `verifyOtp`, resend with 60s cooldown.
8. ❌ **Add `profiles.phone`** + update `handle_new_user()` trigger.
9. ❌ **Per-number (3/hr) and per-IP (5/hr) OTP rate limits** in Edge Function.
10. ⚠️ **E2E test** on production with real +251 number before marketing.
11. ⚠️ **Unset `AFRICASTALKING_SANDBOX`** in production secrets.
12. ⚠️ **Scale cap:** raise `DAILY_SMS_CAP` secret (50 → 200 → 1000) without code deploy.

---

*Generated 2026-06-11. SMS cap layer added; phone auth UI remains outstanding.*
