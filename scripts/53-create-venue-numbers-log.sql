-- ============================================
-- Venue Numbers Log + shared counts (MVP)
-- ============================================

DROP TABLE IF EXISTS venue_numbers_log CASCADE;

CREATE TABLE venue_numbers_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  venue TEXT NOT NULL CHECK (venue IN ('Garrison', 'Spirits', 'Bassment')),
  numbers TEXT NOT NULL, -- free-form (e.g., "8157", "3514", etc.)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_venue_numbers_log_user_id ON venue_numbers_log(user_id);
CREATE INDEX idx_venue_numbers_log_created_at ON venue_numbers_log(created_at DESC);

ALTER TABLE venue_numbers_log DISABLE ROW LEVEL SECURITY;

