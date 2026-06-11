# NalaDate — Supabase setup for phone OTP

Follow these steps in order before launching phone sign-in to real users.

## 1. Run database migrations

In **Supabase Dashboard → SQL Editor**, run each file in order (or use `supabase db push`):

1. `supabase/migrations/017_global_sms_cap.sql` (if not already run)
2. `supabase/migrations/018_phone_auth_profiles.sql`
3. `supabase/migrations/019_otp_rate_limits.sql`

## 2. Enable Phone provider

1. **Authentication → Providers → Phone** → Enable
2. Confirm SMS OTP is enabled for sign-in

## 3. Configure Send SMS Hook

1. **Authentication → Hooks → Send SMS** → Enable
2. Hook type: **HTTPS**
3. URL: `https://<project-ref>.supabase.co/functions/v1/send-sms-hook`
4. Generate a hook secret (format `v1,whsec_...`) and save it

## 4. Deploy Edge Function

```bash
supabase login
supabase link --project-ref <your-project-ref>

supabase secrets set \
  SEND_SMS_HOOK_SECRET="v1,whsec_YOUR_SECRET" \
  AFRICASTALKING_USERNAME="your_at_username" \
  AFRICASTALKING_API_KEY="your_at_api_key" \
  AFRICASTALKING_SENDER_ID="your_sender_id" \
  DAILY_SMS_CAP="50" \
  SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"

supabase functions deploy send-sms-hook --no-verify-jwt
```

For sandbox testing, also set `AFRICASTALKING_SANDBOX=true`.

## 5. OTP expiry

**Authentication → Settings** (or Phone settings):

- Set **OTP expiry** to **600 seconds** (10 minutes)

## 6. Vercel environment variables

Set in Vercel → Project → Settings → Environment Variables:

| Variable | Required |
|----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes |
| `ADMIN_SECRET` | Yes (for `/api/admin/sms-stats`) |
| `DAILY_SMS_CAP` | Optional (default 50; must match Edge Function secret when scaling) |

## 7. Africa's Talking

1. Confirm sender ID is approved for Ethiopia
2. Confirm account has positive SMS balance
3. Test with sandbox before going live

## 8. Optional: schedule OTP cleanup

Run daily in SQL Editor or via pg_cron:

```sql
SELECT public.cleanup_otp_rate_limits();
```

## 9. Verify deployment

1. Visit `https://naladate.com/auth/sign-in`
2. Send OTP to your phone
3. Check `GET /api/admin/sms-stats` with `Authorization: Bearer <ADMIN_SECRET>`
4. Confirm `today.sms_sent_count` incremented
