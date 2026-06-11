-- NalaDate phone auth profile fields

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS auth_method text,
  ADD COLUMN IF NOT EXISTS phone_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS display_name text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_phone_unique
  ON public.profiles (phone)
  WHERE phone IS NOT NULL;

COMMENT ON COLUMN public.profiles.phone IS 'E.164 phone for phone-auth users';
COMMENT ON COLUMN public.profiles.auth_method IS 'phone | email | google';
COMMENT ON COLUMN public.profiles.display_name IS 'Public handle e.g. user_a3f9k2';

-- Block phone OTP if this number belongs to an email/google account in auth.users
CREATE OR REPLACE FUNCTION public.check_phone_email_conflict(p_phone text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users u
    WHERE u.phone = p_phone
      AND u.email IS NOT NULL
      AND trim(u.email) <> ''
  );
$$;

GRANT EXECUTE ON FUNCTION public.check_phone_email_conflict(text) TO service_role;

-- Auto-create profile on signup (phone or email)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  method text;
  generated_name text;
BEGIN
  IF NEW.phone IS NOT NULL AND trim(NEW.phone) <> '' THEN
    method := 'phone';
  ELSIF EXISTS (
    SELECT 1 FROM auth.identities i
    WHERE i.user_id = NEW.id AND i.provider = 'google'
  ) THEN
    method := 'google';
  ELSIF NEW.email IS NOT NULL AND trim(NEW.email) <> '' THEN
    method := 'email';
  ELSE
    method := 'email';
  END IF;

  generated_name := 'user_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6);

  INSERT INTO public.profiles (id, email, phone, auth_method, display_name, phone_verified_at)
  VALUES (
    NEW.id,
    NULLIF(trim(NEW.email), ''),
    NULLIF(trim(NEW.phone), ''),
    method,
    CASE WHEN method = 'phone' THEN generated_name ELSE NULL END,
    CASE WHEN method = 'phone' THEN now() ELSE NULL END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    auth_method = COALESCE(EXCLUDED.auth_method, public.profiles.auth_method),
    display_name = COALESCE(public.profiles.display_name, EXCLUDED.display_name),
    phone_verified_at = COALESCE(EXCLUDED.phone_verified_at, public.profiles.phone_verified_at);

  INSERT INTO public.usage_tracking (user_id, billing_period_start, billing_period_end)
  VALUES (NEW.id, date_trunc('month', now()), date_trunc('month', now()) + interval '1 month')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;
