-- =============================================================================
-- Teret Teret — all migrations combined (run in order)
-- Generated from supabase/migrations/*.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 001_initial.sql
-- -----------------------------------------------------------------------------

-- profiles: one per auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  subscription_status text DEFAULT 'free',
  created_at timestamptz DEFAULT now()
);

-- stories: user-generated stories
CREATE TABLE IF NOT EXISTS public.stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_name text NOT NULL,
  age_group text NOT NULL,
  trait text,
  region text,
  raw_story text NOT NULL,
  parsed_pages jsonb,
  language_default text DEFAULT 'en',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stories_user_id ON public.stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON public.stories(created_at DESC);

-- usage_tracking: free tier count per billing period
CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  generation_count integer DEFAULT 0,
  billing_period_start timestamptz,
  billing_period_end timestamptz,
  last_generated_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON public.usage_tracking(user_id);

-- subscriptions: Stripe subscription state
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- profiles: users can read/update own
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- stories: users can CRUD own
CREATE POLICY "stories_select_own" ON public.stories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "stories_insert_own" ON public.stories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "stories_update_own" ON public.stories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "stories_delete_own" ON public.stories FOR DELETE USING (auth.uid() = user_id);

-- usage_tracking: users can read/update own (update via service role or trigger in practice)
CREATE POLICY "usage_select_own" ON public.usage_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "usage_insert_own" ON public.usage_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "usage_update_own" ON public.usage_tracking FOR UPDATE USING (auth.uid() = user_id);

-- subscriptions: users can read own
CREATE POLICY "subscriptions_select_own" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Trigger: create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  INSERT INTO public.usage_tracking (user_id, billing_period_start, billing_period_end)
  VALUES (NEW.id, date_trunc('month', now()), date_trunc('month', now()) + interval '1 month')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 002_usage_increment_rpc.sql
-- -----------------------------------------------------------------------------

-- Atomic increment for usage_tracking (avoids race when two requests run at once).
-- Caller must ensure the row exists (trigger or upsert) before calling.
CREATE OR REPLACE FUNCTION public.increment_usage(p_user_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.usage_tracking
  SET generation_count = generation_count + 1,
      last_generated_at = now()
  WHERE user_id = p_user_id;
$$;

GRANT EXECUTE ON FUNCTION public.increment_usage(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_usage(uuid) TO service_role;

-- -----------------------------------------------------------------------------
-- 003_illustration_prompts.sql
-- -----------------------------------------------------------------------------

-- Add illustration_prompts column to stories for AI-generated illustration prompts per page
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS illustration_prompts jsonb;

-- -----------------------------------------------------------------------------
-- 003_rolling_usage_window.sql
-- -----------------------------------------------------------------------------

-- Rolling 24-hour window for free story limit (signed-in users).
-- first_story_at: start of the current 24h window; NULL or >24h ago means "window expired".
ALTER TABLE public.usage_tracking
  ADD COLUMN IF NOT EXISTS first_story_at timestamptz DEFAULT NULL;

COMMENT ON COLUMN public.usage_tracking.first_story_at IS 'Start of the current 24h rolling window; NULL or expired means next story starts a new window.';

-- Atomic increment with rolling window: reset window if expired, then increment.
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

GRANT EXECUTE ON FUNCTION public.increment_usage(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_usage(uuid) TO service_role;

-- -----------------------------------------------------------------------------
-- 004_rate_limits.sql
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.rate_limits (
  key text PRIMARY KEY,
  count integer DEFAULT 0,
  window_start timestamptz DEFAULT now()
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 005_phase1_daily_library_progress.sql
-- -----------------------------------------------------------------------------

-- Phase 1: Daily Teret, Favorites/Library, Progress

-- Profiles: streak and daily teret completion
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS streak_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_daily_teret_viewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS completed_daily_teret_dates jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS xp integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level integer DEFAULT 1;

-- Stories: favorite flag for Library
ALTER TABLE public.stories
  ADD COLUMN IF NOT EXISTS is_favorite boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_stories_is_favorite ON public.stories(user_id, is_favorite) WHERE is_favorite = true;

-- -----------------------------------------------------------------------------
-- 006_fix_increment_usage.sql
-- -----------------------------------------------------------------------------

-- Re-apply increment_usage with correct rolling-window behavior.
-- Ensures first_story_at is set to now() when NULL or expired; otherwise preserved.
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

GRANT EXECUTE ON FUNCTION public.increment_usage(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_usage(uuid) TO service_role;

-- -----------------------------------------------------------------------------
-- 007_rate_limits_rls.sql
-- -----------------------------------------------------------------------------

-- Allow service_role to manage rate_limits (used by generate-story and usage APIs via admin client).
CREATE POLICY "rate_limits_service_role"
  ON public.rate_limits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Index for cleanup queries on window_start (e.g. delete expired windows).
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON public.rate_limits (window_start);

-- -----------------------------------------------------------------------------
-- 008_stories_region_default.sql
-- -----------------------------------------------------------------------------

-- Default region for stories so existing rows and new inserts have a safe value.
ALTER TABLE public.stories
  ALTER COLUMN region SET DEFAULT 'Ethiopian highlands';

-- -----------------------------------------------------------------------------
-- 009_saved_words.sql
-- -----------------------------------------------------------------------------

-- Add saved_words to profiles for signed-in users (guests use localStorage)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS saved_words jsonb DEFAULT '[]';

COMMENT ON COLUMN public.profiles.saved_words IS 'Array of VocabWord objects { word, translation_am, translation_es, exampleSentence }';

-- -----------------------------------------------------------------------------
-- 013_stories_illustration_columns.sql
-- -----------------------------------------------------------------------------

-- Ensure stories has both illustration columns to avoid 42703 (column does not exist).
-- App uses illustration_prompts (jsonb). Some code paths or legacy views may reference illustration_prompt (singular).
ALTER TABLE public.stories
  ADD COLUMN IF NOT EXISTS illustration_prompts jsonb;

ALTER TABLE public.stories
  ADD COLUMN IF NOT EXISTS illustration_prompt text;

-- -----------------------------------------------------------------------------
-- 014_child_profiles_story_library.sql
-- -----------------------------------------------------------------------------

-- Child profiles for personalized story creation
CREATE TABLE IF NOT EXISTS public.child_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  age_group text NOT NULL,
  trait text,
  avatar_emoji text DEFAULT '🧒',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_child_profiles_user_id ON public.child_profiles(user_id);

ALTER TABLE public.child_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "child_profiles_select_own" ON public.child_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "child_profiles_insert_own" ON public.child_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "child_profiles_update_own" ON public.child_profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "child_profiles_delete_own" ON public.child_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Story metadata for library display
ALTER TABLE public.stories
  ADD COLUMN IF NOT EXISTS category text;

CREATE INDEX IF NOT EXISTS idx_stories_category ON public.stories(user_id, category);

-- Generation streak tracking (is_favorite and last_generated_at already exist)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS story_generation_dates jsonb DEFAULT '[]';

ALTER TABLE public.usage_tracking
  ADD COLUMN IF NOT EXISTS last_generated_at timestamptz;
