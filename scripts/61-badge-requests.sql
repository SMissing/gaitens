-- Badge requests: staff ask managers to award a badge; managers approve or decline.

CREATE TABLE IF NOT EXISTS badge_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "achievementId" UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  "rejectionReason" TEXT,
  "resolvedBy" UUID REFERENCES users(id) ON DELETE SET NULL,
  "resolvedAt" TIMESTAMP WITH TIME ZONE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS badge_requests_one_pending_per_user_badge
  ON badge_requests ("userId", "achievementId")
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_badge_requests_status ON badge_requests(status);
CREATE INDEX IF NOT EXISTS idx_badge_requests_user ON badge_requests("userId");

ALTER TABLE badge_requests DISABLE ROW LEVEL SECURITY;
