# Phone Auth Cleanup Audit — Teret Stories

**Audit date:** 2026-06-11  
**Baseline commit (pre-phone-auth):** `3d78c598` — *ensure Vercel Analytics is properly initialized*  
**Phone-auth commits:** `9e445a17` → `02ec7ff0` → `9b8e136d` (+ deleted `c1b1d65d` / `0a902e86` NalaDate restore files)

**Teret Stories auth model:** Email + Google only via `/account`. Phone OTP was added by mistake (NalaDate prompt).

---

## Existing email/Google flow impact

| Check | Result |
|-------|--------|
| Email sign-in on `/account` | **Intact** — form unchanged |
| Google OAuth on `/account` | **Intact** — button unchanged |
| `/auth/callback` | **Unchanged** by phone work |
| `lib/supabase/*` | **Unchanged** |
| `app/layout.tsx` | **Unchanged** |
| `package.json` dependencies | **No phone-specific deps added** |

**Only account-page change:** A gold **"Sign in with phone"** link was inserted above Google (added in `9b8e136d`). Removing it restores pre-phone state.

---

## 🔴 ADDED — delete entirely

### Routes & pages
| File | Purpose |
|------|---------|
| `app/auth/sign-in/page.tsx` | NalaDate phone sign-in UI |
| `app/auth/verify/page.tsx` | 6-digit OTP verification |
| `app/discover/page.tsx` | Post-auth discover stub (NalaDate) |
| `app/onboarding/page.tsx` | Post-auth onboarding stub (NalaDate) |

### API routes
| File | Purpose |
|------|---------|
| `app/api/auth/phone/send-otp/route.ts` | Send OTP |
| `app/api/auth/phone/verify-otp/route.ts` | Verify OTP + profile |
| `app/api/auth/phone/resend-otp/route.ts` | Resend OTP |
| `app/api/admin/sms-stats/route.ts` | Daily SMS cap admin |

### Components
| File | Purpose |
|------|---------|
| `components/auth/OtpInput.tsx` | 6-box OTP input |
| `components/auth/PhoneAuthShell.tsx` | NalaDate auth layout shell |

### Libraries
| File | Purpose |
|------|---------|
| `lib/phoneCountries.ts` | Country codes + E.164 validation |
| `lib/phoneAuthServer.ts` | Rate limits, OTP logging, conflict checks |
| `lib/phoneAuthSendOtp.ts` | Shared send/resend logic |
| `lib/phoneAuthConstants.ts` | `PHONE_SESSION_KEY` |

### Supabase migrations (wrong repo — not run on Teret DB)
| File | Purpose |
|------|---------|
| `supabase/migrations/017_global_sms_cap.sql` | Global SMS daily cap |
| `supabase/migrations/018_phone_auth_profiles.sql` | Phone columns on profiles |
| `supabase/migrations/019_otp_rate_limits.sql` | OTP rate limit tables |

### Edge Function
| File | Purpose |
|------|---------|
| `supabase/functions/send-sms-hook/index.ts` | Africa's Talking SMS hook |

### Documentation
| File | Purpose |
|------|---------|
| `phone-auth-audit.md` | NalaDate phone audit |
| `phone-auth-test-plan.md` | Phone OTP QA plan |
| `supabase-setup.md` | Phone OTP Supabase setup |

---

## 🟡 MODIFIED — revert to `3d78c598`

| File | What changed | Revert action |
|------|--------------|---------------|
| `app/account/page.tsx` | Added "Sign in with phone" link | Remove link block |
| `lib/analytics.ts` | Added 6 `trackPhone*` events | Remove phone analytics exports |
| `.env.example` | NalaDate OTP + Africa's Talking + `ADMIN_SECRET` section | Restore Teret-only env docs |
| `tsconfig.json` | `"exclude": [..., "supabase/functions"]` for Deno edge fn | Remove `supabase/functions` exclude |
| `supabase/migrations/all_migrations.sql` | Appended `017_global_sms_cap` SQL block | Truncate to pre-017 state |

---

## 🟢 SAFE — do not touch

| Area | Files / notes |
|------|----------------|
| Vercel Analytics | `components/VercelAnalytics.tsx`, `app/layout.tsx` (commit `3d78c598`) |
| Email/Google auth | `app/auth/callback/route.ts`, `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/admin.ts` |
| Story generation | `app/api/generate-story/route.ts`, `lib/globalDailyCap.ts` |
| Teret migrations 001–016 | Including `015_global_daily_cap.sql` (story cap, not SMS) |
| Amharic translations | `lib/translations/am.ts`, `lib/translations.ts` |
| Premium / Stripe | All `app/api/stripe/*`, `lib/premium.ts` |
| TTS | `lib/azureSpeech.ts`, `app/api/tts/route.ts`, `016_tts_audio_cache.sql` |
| `package.json` | No phone-auth packages added |
| `middleware.ts` | Does not exist |
| `lib/installPrompt.ts` | Matches "phone" in unrelated context only |

---

## Env vars added to `.env.example` (remove)

- `ADMIN_SECRET`
- `DAILY_SMS_CAP`
- `SEND_SMS_HOOK_SECRET`
- `AFRICASTALKING_USERNAME`
- `AFRICASTALKING_API_KEY`
- `AFRICASTALKING_SENDER_ID`
- `AFRICASTALKING_SANDBOX`

---

## Analytics events to remove

- `phone_signup_started`
- `phone_otp_sent`
- `phone_otp_verified`
- `phone_signup_complete`
- `phone_signup_failed`
- `phone_rate_limited`

---

## Removal plan

1. Delete all 🔴 files
2. `git checkout 3d78c598 --` for 🟡 files (or equivalent manual edits)
3. `npm run build` to verify no broken imports
4. Write `phone-auth-cleanup-summary.md`
