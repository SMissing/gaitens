-- Per-user high scores for the Stacker mini-game (tower builder).

CREATE TABLE IF NOT EXISTS stacker_high_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "highScore" INTEGER NOT NULL CHECK ("highScore" >= 0),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("userId")
);

CREATE INDEX IF NOT EXISTS idx_stacker_high_scores_rank
  ON stacker_high_scores ("highScore" DESC);

ALTER TABLE stacker_high_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all users read stacker_high_scores" ON stacker_high_scores;
DROP POLICY IF EXISTS "Allow users insert stacker_high_scores" ON stacker_high_scores;
DROP POLICY IF EXISTS "Allow users update stacker_high_scores" ON stacker_high_scores;

CREATE POLICY "Allow all users read stacker_high_scores" ON stacker_high_scores
  FOR SELECT
  USING (true);

CREATE POLICY "Allow users insert stacker_high_scores" ON stacker_high_scores
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow users update stacker_high_scores" ON stacker_high_scores
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
