-- =============================================================================
-- NalaDate + Teret Stories — FRESH INSTALL (single file)
-- Run once on a new Supabase project via SQL Editor.
-- Replaces migrations 001–019 for disaster recovery.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. CORE TABLES
-- -----------------------------------------------------------------------------

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  phone text,
  auth_method text,
  phone_verified_at timestamptz,
  display_name text,
  subscription_status text DEFAULT 'free',
  -- Teret Stories progress
  streak_count integer DEFAULT 0,
  last_daily_teret_viewed_at timestamptz,
  completed_daily_teret_dates jsonb DEFAULT '[]',
  xp integer DEFAULT 0,
  level integer DEFAULT 1,
  saved_words jsonb DEFAULT '[]',
  story_generation_dates jsonb DEFAULT '[]',
  -- NalaDate profile fields (onboarding / discover)
  full_name text,
  bio text,
  birth_date date,
  gender text,
  city text,
  photo_urls jsonb DEFAULT '[]',
  onboarding_complete boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX idx_profiles_phone_unique ON public.profiles (phone) WHERE phone IS NOT NULL;

CREATE TABLE public.stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_name text NOT NULL,
  age_group text NOT NULL,
  trait text,
  region text DEFAULT 'Ethiopian highlands',
  raw_story text NOT NULL,
  parsed_pages jsonb,
  language_default text DEFAULT 'en',
  illustration_prompts jsonb,
  illustration_prompt text,
  is_favorite boolean DEFAULT false,
  category text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_stories_user_id ON public.stories(user_id);
CREATE INDEX idx_stories_created_at ON public.stories(created_at DESC);
CREATE INDEX idx_stories_is_favorite ON public.stories(user_id, is_favorite) WHERE is_favorite = true;
CREATE INDEX idx_stories_category ON public.stories(user_id, category);

CREATE TABLE public.usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  generation_count integer DEFAULT 0,
  billing_period_start timestamptz,
  billing_period_end timestamptz,
  first_story_at timestamptz,
  last_generated_at timestamptz
);

CREATE INDEX idx_usage_tracking_user_id ON public.usage_tracking(user_id);

CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);

CREATE TABLE public.child_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  age_group text NOT NULL,
  trait text,
  avatar_emoji text DEFAULT '🧒',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_child_profiles_user_id ON public.child_profiles(user_id);

CREATE TABLE public.rate_limits (
  key text PRIMARY KEY,
  count integer DEFAULT 0,
  window_start timestamptz DEFAULT now()
);

CREATE INDEX idx_rate_limits_window_start ON public.rate_limits (window_start);

CREATE TABLE public.global_daily_stats (
  date date PRIMARY KEY DEFAULT CURRENT_DATE,
  story_count integer NOT NULL DEFAULT 0
);

CREATE TABLE public.global_sms_stats (
  date date PRIMARY KEY DEFAULT CURRENT_DATE,
  sms_sent_count integer NOT NULL DEFAULT 0
);

-- OTP rate limiting & logging (phone auth)
CREATE TABLE public.otp_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  ip_address text NOT NULL,
  attempt_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_otp_rate_phone_time ON public.otp_rate_limits (phone, attempt_at DESC);
CREATE INDEX idx_otp_rate_ip_time ON public.otp_rate_limits (ip_address, attempt_at DESC);

CREATE TABLE public.otp_attempt_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  ip_address text,
  action text NOT NULL,
  success boolean NOT NULL DEFAULT false,
  error_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_otp_attempt_logs_phone ON public.otp_attempt_logs (phone, created_at DESC);
CREATE INDEX idx_otp_attempt_logs_created ON public.otp_attempt_logs (created_at DESC);

CREATE TABLE public.otp_verify_failures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  failed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_otp_verify_failures_phone ON public.otp_verify_failures (phone, failed_at DESC);

-- -----------------------------------------------------------------------------
-- 2. NALADATE DATING TABLES (discover / chat — not yet wired in all UI)
-- -----------------------------------------------------------------------------

CREATE TABLE public.swipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  swiped_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  direction text NOT NULL CHECK (direction IN ('like', 'pass')),
  created_at timestamptz DEFAULT now(),
  UNIQUE (swiper_id, swiped_id)
);

CREATE INDEX idx_swipes_swiper ON public.swipes (swiper_id, created_at DESC);
CREATE INDEX idx_swipes_swiped ON public.swipes (swiped_id, direction);

CREATE TABLE public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  CHECK (user_a_id < user_b_id),
  UNIQUE (user_a_id, user_b_id)
);

CREATE INDEX idx_matches_user_a ON public.matches (user_a_id);
CREATE INDEX idx_matches_user_b ON public.matches (user_b_id);

CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE UNIQUE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz DEFAULT now(),
  read_at timestamptz
);

CREATE INDEX idx_messages_conversation ON public.messages (conversation_id, created_at);

-- -----------------------------------------------------------------------------
-- 3. FUNCTIONS
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.increment_usage(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.usage_tracking
  SET
    generation_count = CASE
      WHEN first_story_at IS NULL OR now() > first_story_at + interval '24 hours'
      THEN 1
      ELSE generation_count + 1
    END,
    first_story_at = CASE
      WHEN first_story_at IS NULL OR now() > first_story_at + interval '24 hours'
      THEN now()
      ELSE first_story_at
    END,
    last_generated_at = now()
  WHERE user_id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.reserve_global_daily_story_slot(p_cap integer DEFAULT 500)
RETURNS TABLE(allowed boolean, story_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  today date := CURRENT_DATE;
  cnt integer;
BEGIN
  INSERT INTO public.global_daily_stats (date, story_count) VALUES (today, 0)
  ON CONFLICT (date) DO NOTHING;

  UPDATE public.global_daily_stats
  SET story_count = global_daily_stats.story_count + 1
  WHERE date = today AND global_daily_stats.story_count < p_cap
  RETURNING global_daily_stats.story_count INTO cnt;

  IF FOUND THEN
    allowed := true;
    story_count := cnt;
    RETURN NEXT;
    RETURN;
  END IF;

  SELECT g.story_count INTO cnt FROM public.global_daily_stats g WHERE g.date = today;
  allowed := false;
  story_count := COALESCE(cnt, 0);
  RETURN NEXT;
END;
$$;

CREATE OR REPLACE FUNCTION public.reserve_global_daily_sms_slot(p_cap integer DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  DAILY_SMS_CAP constant integer := 50;
  effective_cap integer;
  today date := CURRENT_DATE;
  updated_count integer;
BEGIN
  effective_cap := COALESCE(p_cap, DAILY_SMS_CAP);

  INSERT INTO public.global_sms_stats (date, sms_sent_count)
  VALUES (today, 0)
  ON CONFLICT (date) DO NOTHING;

  UPDATE public.global_sms_stats
  SET sms_sent_count = global_sms_stats.sms_sent_count + 1
  WHERE date = today AND global_sms_stats.sms_sent_count < effective_cap
  RETURNING global_sms_stats.sms_sent_count INTO updated_count;

  RETURN FOUND;
END;
$$;

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

CREATE OR REPLACE FUNCTION public.cleanup_otp_rate_limits()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.otp_rate_limits WHERE attempt_at < now() - interval '24 hours';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  DELETE FROM public.otp_verify_failures WHERE failed_at < now() - interval '24 hours';
  DELETE FROM public.otp_attempt_logs WHERE created_at < now() - interval '30 days';

  RETURN deleted_count;
END;
$$;

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

-- -----------------------------------------------------------------------------
-- 4. TRIGGERS
-- -----------------------------------------------------------------------------

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY
-- -----------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_sms_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_attempt_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_verify_failures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_select_discover" ON public.profiles FOR SELECT
  USING (onboarding_complete = true AND auth.uid() IS NOT NULL AND id <> auth.uid());

-- stories
CREATE POLICY "stories_select_own" ON public.stories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "stories_insert_own" ON public.stories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "stories_update_own" ON public.stories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "stories_delete_own" ON public.stories FOR DELETE USING (auth.uid() = user_id);

-- usage_tracking
CREATE POLICY "usage_select_own" ON public.usage_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "usage_insert_own" ON public.usage_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "usage_update_own" ON public.usage_tracking FOR UPDATE USING (auth.uid() = user_id);

-- subscriptions
CREATE POLICY "subscriptions_select_own" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- child_profiles
CREATE POLICY "child_profiles_select_own" ON public.child_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "child_profiles_insert_own" ON public.child_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "child_profiles_update_own" ON public.child_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "child_profiles_delete_own" ON public.child_profiles FOR DELETE USING (auth.uid() = user_id);

-- rate_limits (service role only)
CREATE POLICY "rate_limits_service_role" ON public.rate_limits FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- global caps & OTP tables (service role only — Edge Functions + API routes)
CREATE POLICY "global_daily_stats_service_role" ON public.global_daily_stats FOR ALL TO service_role
  USING (true) WITH CHECK (true);
CREATE POLICY "global_sms_stats_service_role" ON public.global_sms_stats FOR ALL TO service_role
  USING (true) WITH CHECK (true);
CREATE POLICY "otp_rate_limits_service_role" ON public.otp_rate_limits FOR ALL TO service_role
  USING (true) WITH CHECK (true);
CREATE POLICY "otp_attempt_logs_service_role" ON public.otp_attempt_logs FOR ALL TO service_role
  USING (true) WITH CHECK (true);
CREATE POLICY "otp_verify_failures_service_role" ON public.otp_verify_failures FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- swipes
CREATE POLICY "swipes_select_own" ON public.swipes FOR SELECT USING (auth.uid() = swiper_id);
CREATE POLICY "swipes_insert_own" ON public.swipes FOR INSERT WITH CHECK (auth.uid() = swiper_id);

-- matches
CREATE POLICY "matches_select_participant" ON public.matches FOR SELECT
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- conversations
CREATE POLICY "conversations_select_participant" ON public.conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = conversations.match_id
        AND (m.user_a_id = auth.uid() OR m.user_b_id = auth.uid())
    )
  );

-- messages
CREATE POLICY "messages_select_participant" ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      JOIN public.matches m ON m.id = c.match_id
      WHERE c.id = messages.conversation_id
        AND (m.user_a_id = auth.uid() OR m.user_b_id = auth.uid())
    )
  );
CREATE POLICY "messages_insert_participant" ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      JOIN public.matches m ON m.id = c.match_id
      WHERE c.id = conversation_id
        AND (m.user_a_id = auth.uid() OR m.user_b_id = auth.uid())
    )
  );

-- -----------------------------------------------------------------------------
-- 6. FUNCTION GRANTS
-- -----------------------------------------------------------------------------

GRANT EXECUTE ON FUNCTION public.increment_usage(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_usage(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.reserve_global_daily_story_slot(integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.reserve_global_daily_sms_slot(integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.check_phone_email_conflict(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_otp_rate_limits() TO service_role;

-- -----------------------------------------------------------------------------
-- 7. STORAGE BUCKETS
-- -----------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tts-cache',
  'tts-cache',
  true,
  5242880,
  ARRAY['audio/mpeg', 'audio/mp3']
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-photos',
  'profile-photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- tts-cache: public read
CREATE POLICY "tts_cache_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'tts-cache');

CREATE POLICY "tts_cache_service_upload"
  ON storage.objects FOR INSERT TO service_role
  WITH CHECK (bucket_id = 'tts-cache');

CREATE POLICY "tts_cache_service_update"
  ON storage.objects FOR UPDATE TO service_role
  USING (bucket_id = 'tts-cache');

-- profile-photos: public read, users upload to own folder
CREATE POLICY "profile_photos_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-photos');

CREATE POLICY "profile_photos_insert_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "profile_photos_update_own"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "profile_photos_delete_own"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- -----------------------------------------------------------------------------
-- 8. COMMENTS
-- -----------------------------------------------------------------------------

COMMENT ON TABLE public.profiles IS 'One row per auth.users — NalaDate + Teret Stories';
COMMENT ON COLUMN public.profiles.phone IS 'E.164 e.g. +2519XXXXXXXX';
COMMENT ON COLUMN public.profiles.auth_method IS 'phone | email | google';
COMMENT ON COLUMN public.profiles.saved_words IS 'VocabWord[] for Teret Stories';
COMMENT ON TABLE public.global_sms_stats IS 'Daily OTP SMS count — capped by reserve_global_daily_sms_slot()';
COMMENT ON TABLE public.swipes IS 'NalaDate like/pass actions';
COMMENT ON TABLE public.matches IS 'Mutual likes between two users';
