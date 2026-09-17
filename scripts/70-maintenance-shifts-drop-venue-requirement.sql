-- ============================================
-- Maintenance clock-in no longer asks which venue —
-- GPS location captured on clock in/out is the source of truth instead.
-- ============================================

ALTER TABLE maintenance_shifts ALTER COLUMN venue DROP NOT NULL;
