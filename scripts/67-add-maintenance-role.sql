-- ============================================
-- Add 'maintenance' as a valid users.role value
-- ============================================
-- Maintenance staff get a bare-bones account: clock in/out only.
-- See scripts/68-create-maintenance-shifts-table.sql for their shift data.
-- ============================================

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('staff', 'manager', 'admin', 'maintenance'));
