-- Add illustration_prompts column to stories for AI-generated illustration prompts per page
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS illustration_prompts jsonb;
