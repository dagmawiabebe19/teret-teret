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
