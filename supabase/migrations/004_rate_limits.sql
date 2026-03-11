-- Rate limiting: IP-based counters for generate-story API
-- Access via service role only (admin client); RLS blocks anon.
CREATE TABLE IF NOT EXISTS public.rate_limits (
  key text PRIMARY KEY,
  count integer DEFAULT 0,
  window_start timestamptz DEFAULT now()
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- No policies: only service role (bypasses RLS) can access
