-- ============================================
-- Create maintenance_breaks table
-- ============================================
-- Breaks taken during a maintenance shift. A shift stays open while on break;
-- worked hours = shift length minus the total of its breaks.
-- Access control is handled in API routes (cookie session auth),
-- so RLS is disabled to match the rest of this project.
-- ============================================

CREATE TABLE IF NOT EXISTS maintenance_breaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "shiftId" UUID NOT NULL REFERENCES maintenance_shifts(id) ON DELETE CASCADE,
  "startAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "endAt" TIMESTAMP WITH TIME ZONE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_breaks_shift_id ON maintenance_breaks("shiftId");

-- Only one break in progress per shift (enforced in API routes, backstopped here).
CREATE UNIQUE INDEX IF NOT EXISTS idx_maintenance_breaks_one_open_per_shift
  ON maintenance_breaks("shiftId")
  WHERE "endAt" IS NULL;

ALTER TABLE maintenance_breaks DISABLE ROW LEVEL SECURITY;
