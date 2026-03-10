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
