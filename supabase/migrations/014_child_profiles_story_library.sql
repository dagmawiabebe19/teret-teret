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
