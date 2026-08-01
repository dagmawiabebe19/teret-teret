-- Lives feature: AI interactive life-sim game mode
-- Additive only — does not modify existing story/TTS tables.

-- ---------------------------------------------------------------------------
-- scenarios — life templates
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  world_bible text NOT NULL,
  starting_stats jsonb NOT NULL DEFAULT '{}',
  starting_relationships jsonb NOT NULL DEFAULT '[]',
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scenarios_select_published" ON public.scenarios
  FOR SELECT
  TO authenticated, anon
  USING (is_published = true);

-- ---------------------------------------------------------------------------
-- lives — one row per playthrough
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario_id uuid NOT NULL REFERENCES public.scenarios(id),
  name text NOT NULL,
  age int NOT NULL DEFAULT 18,
  stats jsonb NOT NULL DEFAULT '{}',
  summary text NOT NULL DEFAULT '',
  turn_count int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lives_user_id ON public.lives(user_id);

ALTER TABLE public.lives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lives_select_own" ON public.lives
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "lives_insert_own" ON public.lives
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "lives_update_own" ON public.lives
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "lives_delete_own" ON public.lives
  FOR DELETE USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- life_relationships
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.life_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  life_id uuid NOT NULL REFERENCES public.lives(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text,
  dimensions jsonb NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_life_relationships_life_id ON public.life_relationships(life_id);

ALTER TABLE public.life_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "life_relationships_select_own" ON public.life_relationships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.lives
      WHERE lives.id = life_relationships.life_id
        AND lives.user_id = auth.uid()
    )
  );
CREATE POLICY "life_relationships_insert_own" ON public.life_relationships
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lives
      WHERE lives.id = life_relationships.life_id
        AND lives.user_id = auth.uid()
    )
  );
CREATE POLICY "life_relationships_update_own" ON public.life_relationships
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.lives
      WHERE lives.id = life_relationships.life_id
        AND lives.user_id = auth.uid()
    )
  );
CREATE POLICY "life_relationships_delete_own" ON public.life_relationships
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.lives
      WHERE lives.id = life_relationships.life_id
        AND lives.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- life_beats — turn log / memory source
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.life_beats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  life_id uuid NOT NULL REFERENCES public.lives(id) ON DELETE CASCADE,
  turn_number int NOT NULL,
  scene_text text NOT NULL,
  choices jsonb NOT NULL DEFAULT '[]',
  chosen_index int,
  deltas_applied jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_life_beats_life_id_turn_number
  ON public.life_beats(life_id, turn_number);

ALTER TABLE public.life_beats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "life_beats_select_own" ON public.life_beats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.lives
      WHERE lives.id = life_beats.life_id
        AND lives.user_id = auth.uid()
    )
  );
CREATE POLICY "life_beats_insert_own" ON public.life_beats
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lives
      WHERE lives.id = life_beats.life_id
        AND lives.user_id = auth.uid()
    )
  );
CREATE POLICY "life_beats_update_own" ON public.life_beats
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.lives
      WHERE lives.id = life_beats.life_id
        AND lives.user_id = auth.uid()
    )
  );
CREATE POLICY "life_beats_delete_own" ON public.life_beats
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.lives
      WHERE lives.id = life_beats.life_id
        AND lives.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Seed: Immigrant to America
-- ---------------------------------------------------------------------------
INSERT INTO public.scenarios (
  slug,
  title,
  description,
  world_bible,
  starting_stats,
  starting_relationships,
  is_published
) VALUES (
  'immigrant-america',
  'Immigrant to America',
  'A young Ethiopian arrives in America with little money and everything to prove.',
  $bible$
You are the narrator of an interactive life simulation. The player is a young Ethiopian who has just arrived in America with almost no money, a suitcase of mixed hope and fear, and the weight of family expectations across an ocean. Write in a grounded, emotionally real voice — no melodrama, no cartoon villains, no easy miracles. Everyday details matter: rent, accents, loneliness at 2 a.m., the smell of berbere in a shared kitchen, the sting of a job rejection. Choices have lasting consequences for health, money, relationships, and self-respect. Keep scenes vivid but concise. End every scene on a hook that forces a meaningful decision — never a tidy resolution.
  $bible$,
  '{
    "health": 70,
    "money": 15,
    "reputation": 40,
    "intelligence": 55,
    "strength": 50,
    "happiness": 45,
    "energy": 60
  }'::jsonb,
  '[
    {
      "name": "Mother",
      "role": "family",
      "dimensions": { "trust": 80, "love": 90, "respect": 75, "jealousy": 5 }
    },
    {
      "name": "Friend",
      "role": "friend",
      "dimensions": { "trust": 65, "love": 40, "respect": 60, "jealousy": 10 }
    }
  ]'::jsonb,
  true
)
ON CONFLICT (slug) DO NOTHING;
