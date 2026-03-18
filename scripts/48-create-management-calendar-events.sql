-- ============================================
-- Management calendar (secondary calendar)
-- ============================================

DROP TABLE IF EXISTS management_calendar_events CASCADE;

CREATE TABLE management_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (
    event_type IN ('management_meeting', 'pubwatch', 'disciplinary', 'custom')
  ),
  description TEXT,
  site TEXT,

  start_date DATE NOT NULL,
  end_date DATE,
  start_time TIME,
  end_time TIME,

  recurrence_type TEXT NOT NULL DEFAULT 'none' CHECK (recurrence_type IN ('none', 'weekly')),
  recurrence_weekday INTEGER, -- 0=Sun..6=Sat (weekly only)
  recurrence_interval INTEGER NOT NULL DEFAULT 1, -- weekly interval in weeks
  recurrence_end_date DATE,

  visible BOOLEAN NOT NULL DEFAULT TRUE,

  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Helpful indexes for date-range queries + type filters
CREATE INDEX idx_mce_start_date ON management_calendar_events(start_date);
CREATE INDEX idx_mce_end_date ON management_calendar_events(end_date);
CREATE INDEX idx_mce_recur_end_date ON management_calendar_events(recurrence_end_date);
CREATE INDEX idx_mce_type ON management_calendar_events(event_type);
CREATE INDEX idx_mce_created_by ON management_calendar_events(created_by);

-- We'll handle permissions at the API layer.
ALTER TABLE management_calendar_events DISABLE ROW LEVEL SECURITY;

