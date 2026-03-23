-- ============================================
-- Barred List disclaimer acceptance tracking
-- ============================================
-- Per-user counter + last acceptance time on `users`, plus append-only audit rows
-- for each acceptance (timestamps for compliance / disputes).
-- Auth is app-layer; RLS disabled on audit table to match project pattern.
-- ============================================

-- Counters on users (fast lookup per account)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS "barredDisclaimerAcceptCount" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS "barredDisclaimerLastAcceptedAt" TIMESTAMP WITH TIME ZONE;

-- One row per acceptance event (proof trail)
CREATE TABLE IF NOT EXISTS barred_disclaimer_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "acceptedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_barred_disclaimer_acceptances_user
  ON barred_disclaimer_acceptances("userId", "acceptedAt" DESC);

ALTER TABLE barred_disclaimer_acceptances DISABLE ROW LEVEL SECURITY;
