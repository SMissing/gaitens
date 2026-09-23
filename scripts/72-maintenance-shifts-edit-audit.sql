-- ============================================
-- Manager/admin edits to maintenance shift times
-- ============================================
-- Maintenance staff frequently forget to clock out, so managers can now
-- correct clock in/out times from the maintenance log. These columns record
-- who made the last correction and when, so edited hours are visible.
-- ============================================

ALTER TABLE maintenance_shifts
  ADD COLUMN IF NOT EXISTS "editedById" UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "editedAt" TIMESTAMP WITH TIME ZONE;
