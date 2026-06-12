-- Daily TTS character budget for free signed-in users (premium / Ethiopia free = unlimited).
CREATE TABLE IF NOT EXISTS public.daily_tts_usage (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date date NOT NULL DEFAULT (CURRENT_DATE AT TIME ZONE 'UTC'),
  characters_used integer NOT NULL DEFAULT 0 CHECK (characters_used >= 0),
  PRIMARY KEY (user_id, usage_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_tts_usage_date ON public.daily_tts_usage (usage_date);

ALTER TABLE public.daily_tts_usage ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.daily_tts_usage IS 'Tracks Azure/ElevenLabs character usage per user per UTC day; free tier capped at 10k/day.';
