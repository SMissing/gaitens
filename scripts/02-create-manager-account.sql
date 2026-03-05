-- ============================================
-- Create Manager Account
-- ============================================
-- Run this script AFTER running 01-create-tables.sql
-- This creates the manager account: Missing (code: 7266)
-- ============================================

INSERT INTO users (name, "staffCode", role, active)
VALUES ('Missing', '7266', 'manager', true)
ON CONFLICT ("staffCode") DO UPDATE
SET 
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  active = EXCLUDED.active;

-- Verify the user was created
SELECT 
  id,
  name,
  "staffCode",
  role,
  active,
  "createdAt"
FROM users
WHERE "staffCode" = '7266';

-- ============================================
-- Manager account created successfully!
-- ============================================
-- Login credentials:
--   Staff Code: 7266
--   Name: Missing
--   Role: manager
-- ============================================
