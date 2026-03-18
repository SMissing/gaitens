-- ============================================
-- Training: explicit required control
-- ============================================

-- requiredScope controls which users consider a module "required":
-- - none: optional
-- - site: required only for the matching site (including when both are null)
-- - all: required for all sites
ALTER TABLE training_courses
ADD COLUMN IF NOT EXISTS "requiredScope" TEXT NOT NULL DEFAULT 'none'
CHECK ("requiredScope" IN ('none', 'site', 'all'));

CREATE INDEX IF NOT EXISTS idx_training_courses_required_scope ON training_courses("requiredScope");

