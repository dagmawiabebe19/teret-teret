-- Public bucket for cached ElevenLabs TTS audio (paths are content hashes)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tts-cache',
  'tts-cache',
  true,
  5242880,
  ARRAY['audio/mpeg', 'audio/mp3']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "tts_cache_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'tts-cache');
