-- ============================================
-- Update grievances table with required fields
-- ============================================
-- This migration adds all required fields for the grievance form
-- based on company policy
-- ============================================

-- Add new columns to grievances table
ALTER TABLE grievances
ADD COLUMN IF NOT EXISTS "employeeName" TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS "relatesToEmployment" TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS "howToResolve" TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS "otherParties" TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS "whatHasBeenDone" TEXT NOT NULL DEFAULT '';

-- Update existing rows to have empty strings (since they're required)
UPDATE grievances
SET 
  "employeeName" = '',
  "relatesToEmployment" = '',
  "howToResolve" = '',
  "otherParties" = '',
  "whatHasBeenDone" = ''
WHERE "employeeName" IS NULL;

-- Now make them NOT NULL (remove defaults after updating)
ALTER TABLE grievances
ALTER COLUMN "employeeName" DROP DEFAULT,
ALTER COLUMN "relatesToEmployment" DROP DEFAULT,
ALTER COLUMN "howToResolve" DROP DEFAULT,
ALTER COLUMN "otherParties" DROP DEFAULT,
ALTER COLUMN "whatHasBeenDone" DROP DEFAULT;

-- Rename 'subject' to 'grievance' if needed (or keep both)
-- The 'subject' field can remain as a summary/title
-- 'content' can be used for the detailed grievance description

-- Add index for status queries (for admin filtering)
CREATE INDEX IF NOT EXISTS idx_grievances_status ON grievances(status);

-- Add index for created date queries
CREATE INDEX IF NOT EXISTS idx_grievances_created ON grievances("createdAt");

-- Note: RLS policies are already configured in scripts/03-fix-rls-policies.sql
-- Staff can create grievances but cannot view them (only admins can view)
