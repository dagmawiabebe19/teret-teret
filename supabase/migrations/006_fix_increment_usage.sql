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
