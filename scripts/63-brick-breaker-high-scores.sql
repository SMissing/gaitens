-- Per-user high scores for the staff Brick Breaker game (10 levels).
-- Leaderboard reads are authenticated in the app; RLS matches other portal tables.

CREATE TABLE IF NOT EXISTS brick_breaker_high_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "highScore" INTEGER NOT NULL CHECK ("highScore" >= 0),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("userId")
);

CREATE INDEX IF NOT EXISTS idx_brick_breaker_high_scores_rank
  ON brick_breaker_high_scores ("highScore" DESC);

ALTER TABLE brick_breaker_high_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all users read brick_breaker_high_scores" ON brick_breaker_high_scores;
DROP POLICY IF EXISTS "Allow users insert brick_breaker_high_scores" ON brick_breaker_high_scores;
DROP POLICY IF EXISTS "Allow users update brick_breaker_high_scores" ON brick_breaker_high_scores;

CREATE POLICY "Allow all users read brick_breaker_high_scores" ON brick_breaker_high_scores
  FOR SELECT
  USING (true);

CREATE POLICY "Allow users insert brick_breaker_high_scores" ON brick_breaker_high_scores
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow users update brick_breaker_high_scores" ON brick_breaker_high_scores
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
