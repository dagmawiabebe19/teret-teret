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
