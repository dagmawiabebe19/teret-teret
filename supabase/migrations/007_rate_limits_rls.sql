-- Allow service_role to manage rate_limits (used by generate-story and usage APIs via admin client).
CREATE POLICY "rate_limits_service_role"
  ON public.rate_limits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Index for cleanup queries on window_start (e.g. delete expired windows).
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON public.rate_limits (window_start);
