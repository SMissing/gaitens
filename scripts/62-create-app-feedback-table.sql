-- App feedback: ideas/issues/questions about the portal (not venue ideas).
-- Team submits; admins set status and an optional comment.

CREATE TABLE IF NOT EXISTS app_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('feature', 'issue', 'question')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  "adminStatus" TEXT NOT NULL DEFAULT 'open' CHECK ("adminStatus" IN ('open', 'denied', 'working_on_it', 'completed')),
  "adminComment" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_feedback_created ON app_feedback("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_app_feedback_category ON app_feedback(category);
CREATE INDEX IF NOT EXISTS idx_app_feedback_admin_status ON app_feedback("adminStatus");

ALTER TABLE app_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all users read app_feedback" ON app_feedback;
DROP POLICY IF EXISTS "Allow users to create app_feedback" ON app_feedback;
DROP POLICY IF EXISTS "Allow admins to update app_feedback" ON app_feedback;

CREATE POLICY "Allow all users read app_feedback" ON app_feedback
  FOR SELECT
  USING (true);

CREATE POLICY "Allow users to create app_feedback" ON app_feedback
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow admins to update app_feedback" ON app_feedback
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
