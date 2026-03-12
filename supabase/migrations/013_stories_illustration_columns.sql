-- Ensure stories has both illustration columns to avoid 42703 (column does not exist).
-- App uses illustration_prompts (jsonb). Some code paths or legacy views may reference illustration_prompt (singular).
ALTER TABLE public.stories
  ADD COLUMN IF NOT EXISTS illustration_prompts jsonb;

ALTER TABLE public.stories
  ADD COLUMN IF NOT EXISTS illustration_prompt text;
