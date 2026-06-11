-- OTP rate limiting, attempt logs, verify failure tracking

CREATE TABLE IF NOT EXISTS public.otp_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  ip_address text NOT NULL,
  attempt_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_otp_rate_phone_time ON public.otp_rate_limits (phone, attempt_at DESC);
CREATE INDEX IF NOT EXISTS idx_otp_rate_ip_time ON public.otp_rate_limits (ip_address, attempt_at DESC);

ALTER TABLE public.otp_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.otp_attempt_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  ip_address text,
  action text NOT NULL,
  success boolean NOT NULL DEFAULT false,
  error_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_otp_attempt_logs_phone ON public.otp_attempt_logs (phone, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_otp_attempt_logs_created ON public.otp_attempt_logs (created_at DESC);

ALTER TABLE public.otp_attempt_logs ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.otp_verify_failures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  failed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_otp_verify_failures_phone ON public.otp_verify_failures (phone, failed_at DESC);

ALTER TABLE public.otp_verify_failures ENABLE ROW LEVEL SECURITY;

-- Delete OTP rate-limit rows older than 24 hours (run via pg_cron or manual)
CREATE OR REPLACE FUNCTION public.cleanup_otp_rate_limits()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.otp_rate_limits WHERE attempt_at < now() - interval '24 hours';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  DELETE FROM public.otp_verify_failures WHERE failed_at < now() - interval '24 hours';
  DELETE FROM public.otp_attempt_logs WHERE created_at < now() - interval '30 days';

  RETURN deleted_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cleanup_otp_rate_limits() TO service_role;
