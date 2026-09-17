-- ============================================
-- Create maintenance_shifts table
-- ============================================
-- Clock in/out records for maintenance staff:
-- - venue actually worked that shift (maintenance accounts roam between venues)
-- - GPS location captured on clock in and clock out (best-effort)
-- - end-of-shift notes + photos
-- Access control is handled in API routes (cookie session auth),
-- so RLS is disabled to match the rest of this project.
-- ============================================

CREATE TABLE IF NOT EXISTS maintenance_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  venue TEXT NOT NULL CHECK (venue IN ('Garrison', 'Spirits', 'Bassment', 'Other')),
  "clockInAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "clockInLat" DOUBLE PRECISION,
  "clockInLng" DOUBLE PRECISION,
  "clockInAccuracy" DOUBLE PRECISION,
  "clockOutAt" TIMESTAMP WITH TIME ZONE,
  "clockOutLat" DOUBLE PRECISION,
  "clockOutLng" DOUBLE PRECISION,
  "clockOutAccuracy" DOUBLE PRECISION,
  notes TEXT,
  photos TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  "closedByAdmin" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_shifts_user_id ON maintenance_shifts("userId");
CREATE INDEX IF NOT EXISTS idx_maintenance_shifts_clock_in_at ON maintenance_shifts("clockInAt" DESC);
CREATE INDEX IF NOT EXISTS idx_maintenance_shifts_status ON maintenance_shifts(status);

-- Only one open shift per user should exist at a time (enforced in API routes,
-- this partial unique index backstops it at the DB level).
CREATE UNIQUE INDEX IF NOT EXISTS idx_maintenance_shifts_one_open_per_user
  ON maintenance_shifts("userId")
  WHERE status = 'open';

ALTER TABLE maintenance_shifts DISABLE ROW LEVEL SECURITY;
