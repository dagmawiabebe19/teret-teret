-- Global daily SMS cap (all OTP sends combined) — prevents runaway Africa's Talking costs
CREATE TABLE IF NOT EXISTS public.global_sms_stats (
  date date PRIMARY KEY DEFAULT CURRENT_DATE,
  sms_sent_count integer NOT NULL DEFAULT 0
);

ALTER TABLE public.global_sms_stats ENABLE ROW LEVEL SECURITY;

-- Atomically reserve one SMS slot if under cap. Returns true if allowed, false if cap reached.
CREATE OR REPLACE FUNCTION public.reserve_global_daily_sms_slot(p_cap integer DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  DAILY_SMS_CAP constant integer := 50;
  effective_cap integer;
  today date := CURRENT_DATE;
  updated_count integer;
BEGIN
  effective_cap := COALESCE(p_cap, DAILY_SMS_CAP);

  INSERT INTO public.global_sms_stats (date, sms_sent_count)
  VALUES (today, 0)
  ON CONFLICT (date) DO NOTHING;

  UPDATE public.global_sms_stats
  SET sms_sent_count = global_sms_stats.sms_sent_count + 1
  WHERE date = today AND global_sms_stats.sms_sent_count < effective_cap
  RETURNING global_sms_stats.sms_sent_count INTO updated_count;

  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.reserve_global_daily_sms_slot(integer) TO service_role;

COMMENT ON TABLE public.global_sms_stats IS 'Daily count of OTP SMS sent via send-sms-hook Edge Function';
COMMENT ON FUNCTION public.reserve_global_daily_sms_slot IS 'Atomically increments today SMS count if under cap; returns false when daily limit reached';
