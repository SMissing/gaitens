-- ============================================
-- Create maintenance_rota table
-- ============================================
-- Admin-scheduled shifts for maintenance staff (who's expected where, when).
-- Separate from maintenance_shifts (actual clock in/out records) — this is
-- the plan, that table is the reality.
-- One-off dated entries only (no recurrence).
-- Access control is handled in API routes (cookie session auth),
-- so RLS is disabled to match the rest of this project.
-- ============================================

CREATE TABLE IF NOT EXISTS maintenance_rota (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  "startTime" TIME,
  "endTime" TIME,
  notes TEXT,
  "createdBy" UUID REFERENCES users(id) ON DELETE SET NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_rota_user_id ON maintenance_rota("userId");
CREATE INDEX IF NOT EXISTS idx_maintenance_rota_date ON maintenance_rota(date);

ALTER TABLE maintenance_rota DISABLE ROW LEVEL SECURITY;
