-- Add saved_words to profiles for signed-in users (guests use localStorage)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS saved_words jsonb DEFAULT '[]';

COMMENT ON COLUMN public.profiles.saved_words IS 'Array of VocabWord objects { word, translation_am, translation_es, exampleSentence }';
