-- Global daily story generation cap (all users combined)
CREATE TABLE IF NOT EXISTS public.global_daily_stats (
  date date PRIMARY KEY DEFAULT CURRENT_DATE,
  story_count integer NOT NULL DEFAULT 0
);

ALTER TABLE public.global_daily_stats ENABLE ROW LEVEL SECURITY;

-- Atomically reserve a slot if under cap; returns allowed + current count
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

GRANT EXECUTE ON FUNCTION public.reserve_global_daily_story_slot(integer) TO service_role;
