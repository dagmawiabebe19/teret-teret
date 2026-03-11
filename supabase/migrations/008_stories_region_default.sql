-- Default region for stories so existing rows and new inserts have a safe value.
ALTER TABLE public.stories
  ALTER COLUMN region SET DEFAULT 'Ethiopian highlands';
