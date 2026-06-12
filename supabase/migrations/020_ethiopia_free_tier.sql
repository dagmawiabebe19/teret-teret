-- Ethiopia free tier: full app access for users who sign up from Ethiopia (geo at first profile touch).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_ethiopia_free boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS signup_country text;

COMMENT ON COLUMN public.profiles.is_ethiopia_free IS 'Permanent full access for users whose signup_country was ET at first detection.';
COMMENT ON COLUMN public.profiles.signup_country IS 'ISO 3166-1 alpha-2 country code at signup (set once, never changed).';
