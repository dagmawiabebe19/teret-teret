-- Indexes for admin stats and profile queries.
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status
  ON public.profiles (subscription_status);

CREATE INDEX IF NOT EXISTS idx_profiles_signup_country
  ON public.profiles (signup_country)
  WHERE signup_country IS NOT NULL;
