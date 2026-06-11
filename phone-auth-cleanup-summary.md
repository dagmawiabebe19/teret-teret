# Phone Auth Cleanup Summary — Teret Stories

**Date:** 2026-06-11  
**Commit baseline restored from:** `3d78c598` (pre-phone-auth)  
**Build:** `npm run build` — ✅ passed (17 routes, no phone auth routes)

---

## Deleted files (21)

### Pages & API
- `app/auth/sign-in/page.tsx`
- `app/auth/verify/page.tsx`
- `app/discover/page.tsx`
- `app/onboarding/page.tsx`
- `app/api/auth/phone/send-otp/route.ts`
- `app/api/auth/phone/verify-otp/route.ts`
- `app/api/auth/phone/resend-otp/route.ts`
- `app/api/admin/sms-stats/route.ts`

### Components & libs
- `components/auth/OtpInput.tsx`
- `components/auth/PhoneAuthShell.tsx`
- `lib/phoneCountries.ts`
- `lib/phoneAuthServer.ts`
- `lib/phoneAuthSendOtp.ts`
- `lib/phoneAuthConstants.ts`

### Supabase
- `supabase/migrations/017_global_sms_cap.sql`
- `supabase/migrations/018_phone_auth_profiles.sql`
- `supabase/migrations/019_otp_rate_limits.sql`
- `supabase/functions/send-sms-hook/index.ts`

### Docs
- `phone-auth-audit.md`
- `phone-auth-test-plan.md`
- `supabase-setup.md`

---

## Reverted files (5)

| File | Change |
|------|--------|
| `app/account/page.tsx` | Removed "Sign in with phone" link; email + Google only |
| `lib/analytics.ts` | Removed `trackPhone*` events (6 functions) |
| `.env.example` | Removed NalaDate/Africa's Talking/ADMIN_SECRET block |
| `tsconfig.json` | Removed `supabase/functions` exclude |
| `supabase/migrations/all_migrations.sql` | Removed appended 017 SMS cap SQL |

---

## Verification

| Check | Status |
|-------|--------|
| `/account` email + Google sign-in | ✅ Restored to pre-phone state |
| `/auth/callback` OAuth | ✅ Unchanged |
| `lib/supabase/*` | ✅ Unchanged |
| `app/layout.tsx` + Vercel Analytics | ✅ Unchanged |
| No imports to deleted files | ✅ Grep clean (except audit doc) |
| `package.json` phone-only deps | ✅ None were added |
| Story generation (`/api/generate-story`) | ✅ Routes present |
| Premium / Stripe webhooks | ✅ Routes present |
| Teret migration `015_global_daily_cap` (stories) | ✅ Kept — not phone-related |

---

## Intentionally kept

- `phone-auth-cleanup-audit.md` — this cleanup audit record
- `phone-auth-cleanup-summary.md` — this file
- Migrations `001`–`016` — Teret Stories schema
- `015_global_daily_cap.sql` — daily **story** cap (not SMS)

---

## Teret auth after cleanup

Users sign in at **`/account`** via:
1. Continue with Google
2. Email + password (sign in / sign up)

No phone routes remain in the app.
