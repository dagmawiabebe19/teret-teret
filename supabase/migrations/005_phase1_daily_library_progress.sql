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
