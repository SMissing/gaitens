-- ============================================
-- Create meetings table
-- ============================================

-- Drop table if it exists (to avoid conflicts)
DROP TABLE IF EXISTS meetings CASCADE;

CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  requested_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  requested_for UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'reschedule_requested', 'reschedule_proposed', 'cancelled')),
  suggested_date DATE NOT NULL,
  suggested_time TIME,
  meeting_date DATE,
  meeting_time TIME,
  reschedule_reason TEXT,
  last_action_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_meetings_requested_by ON meetings(requested_by);
CREATE INDEX idx_meetings_requested_for ON meetings(requested_for);
CREATE INDEX idx_meetings_status ON meetings(status);
CREATE INDEX idx_meetings_suggested_date ON meetings(suggested_date);
CREATE INDEX idx_meetings_meeting_date ON meetings(meeting_date);

-- Disable RLS (we'll handle auth at API level)
ALTER TABLE meetings DISABLE ROW LEVEL SECURITY;
