-- ============================================
-- Extend meetings with CC, follow-ups, severity
-- ============================================

-- Severity banner for meetings
ALTER TABLE meetings
ADD COLUMN IF NOT EXISTS severity TEXT NOT NULL DEFAULT 'medium'
CHECK (severity IN ('low', 'medium', 'high', 'critical'));

-- CC users join table
DROP TABLE IF EXISTS meeting_cc_users;
CREATE TABLE meeting_cc_users (
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (meeting_id, user_id)
);

CREATE INDEX idx_mcu_meeting_id ON meeting_cc_users(meeting_id);

-- Follow-up notes table
DROP TABLE IF EXISTS meeting_followups;
CREATE TABLE meeting_followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mf_meeting_id_created_at ON meeting_followups(meeting_id, created_at DESC);

ALTER TABLE meeting_cc_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_followups DISABLE ROW LEVEL SECURITY;

