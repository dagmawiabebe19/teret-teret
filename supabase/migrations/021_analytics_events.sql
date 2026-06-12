-- Server-side funnel analytics (admin / conversion reporting).
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  session_id text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  properties jsonb NOT NULL DEFAULT '{}'::jsonb,
  device_type text,
  country text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_name_created
  ON public.analytics_events (event_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_created
  ON public.analytics_events (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_session
  ON public.analytics_events (session_id)
  WHERE session_id IS NOT NULL;

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Only service role inserts/reads (via API routes with admin client).
CREATE POLICY "analytics_events_service_role"
  ON public.analytics_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
