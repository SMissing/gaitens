-- ============================================
-- Blog posts (Community)
-- ============================================
-- Admins create posts; all authenticated staff can read published posts.
-- Auth is enforced in API routes and server components.
-- ============================================

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  body TEXT NOT NULL,
  published BOOLEAN NOT NULL DEFAULT false,
  "publishedAt" TIMESTAMPTZ,
  "visibleToStaff" BOOLEAN NOT NULL DEFAULT true,
  "visibleToManager" BOOLEAN NOT NULL DEFAULT true,
  "visibleToAdmin" BOOLEAN NOT NULL DEFAULT true,
  "createdBy" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT blog_posts_slug_unique UNIQUE (slug)
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts("publishedAt" DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published) WHERE published = true;

ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;
