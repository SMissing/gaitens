-- ============================================
-- Blog post audience visibility
-- ============================================
-- Per-post toggles: which roles can see the post on /blog when published.
-- ============================================

ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "visibleToStaff" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "visibleToManager" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "visibleToAdmin" BOOLEAN NOT NULL DEFAULT true;
