# NalaDate phone OTP — test plan

Run these before inviting a test group. Use production URL (not localhost) for SMS delivery.

## Prerequisites

- [ ] Migrations 017, 018, 019 applied
- [ ] Edge Function `send-sms-hook` deployed with secrets
- [ ] Phone provider + Send SMS Hook enabled in Supabase
- [ ] `ADMIN_SECRET` set on Vercel

---

## Tests

### 1. Send OTP (Ethiopia)

1. Open `/auth/sign-in`
2. Confirm country defaults to 🇪🇹 +251
3. Enter your number: `9XX XXX XXX` (9 digits)
4. Tap **Send code**
5. **Expected:** Navigate to `/auth/verify`; SMS arrives within **60 seconds**

### 2. Verify → new profile

1. Enter the 6-digit code from SMS
2. **Expected:** Redirect to `/onboarding`
3. In Supabase → `profiles` table: row with your `phone` in E.164, `auth_method = phone`, `display_name` like `user_xxxxxx`

### 3. Sign in again (existing user)

1. Sign out from `/account`
2. Repeat sign-in with same number + new OTP
3. **Expected:** Redirect to `/discover` (not onboarding)

### 4. Per-number rate limit (3/hour)

1. Request OTP 3 times successfully (wait 60s between resends)
2. Request a 4th time
3. **Expected:** Error *"Too many attempts. Please try again in an hour."*

### 5. Wrong code soft lock (5 attempts)

1. Enter wrong code 5 times on `/auth/verify`
2. **Expected:** 6th attempt blocked with 15-minute lock message
3. Boxes clear on each error

### 6. OTP expiry (10 minutes)

1. Send OTP, wait **11 minutes**
2. Enter the old code
3. **Expected:** *"Code is incorrect or expired..."*
4. Resend and use fresh code — should work

### 7. Mobile browsers

- [ ] iPhone Safari — numeric keyboard, paste OTP works
- [ ] Android Chrome — auto-advance between boxes

### 8. Diaspora number (+1)

1. Select +1 US/Canada
2. Enter 10-digit number
3. Complete flow
4. **Expected:** Same success path if AT delivers to that region

### 9. Admin SMS stats

```bash
curl -s -H "Authorization: Bearer $ADMIN_SECRET" \
  https://naladate.com/api/admin/sms-stats | jq
```

**Expected:** `today.sms_sent_count` matches number of successful sends today

### 10. Email conflict block

1. Create account with email at `/account`
2. Attempt phone sign-up with same number (if linked in auth.users)
3. **Expected:** *"This number is associated with an email account. Sign in with email."*

### 11. Google / email still work

- [ ] Google sign-in from `/auth/sign-in` → `/discover`
- [ ] Email sign-in at `/account` unchanged

### 12. Global daily cap (50)

After 50 successful SMS sends in one day (or lower `DAILY_SMS_CAP` for testing):

**Expected:** Hook returns cap message; user sees send failure

---

## Analytics (Vercel)

Confirm events in Vercel Analytics dashboard:

- `phone_signup_started`
- `phone_otp_sent`
- `phone_otp_verified`
- `phone_signup_complete` (new users only)
- `phone_signup_failed` (with reason)
- `phone_rate_limited` (when applicable)
