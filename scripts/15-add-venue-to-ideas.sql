-- ============================================
-- Add venue field to ideas table
-- ============================================
-- This migration adds a venue field to the ideas table
-- to specify which business location the idea is for
-- ============================================
-- Run this script in Supabase SQL Editor
-- ============================================

-- Add venue column to ideas table
ALTER TABLE ideas
ADD COLUMN IF NOT EXISTS venue TEXT CHECK (venue IN ('Garrison', 'Spirits', 'Bassment', 'All'));

-- Add index for venue queries
CREATE INDEX IF NOT EXISTS idx_ideas_venue ON ideas(venue);

-- Add index for user queries (if not already exists)
CREATE INDEX IF NOT EXISTS idx_ideas_user ON ideas("userId");

-- Add index for created date queries (if not already exists)
CREATE INDEX IF NOT EXISTS idx_ideas_created ON ideas("createdAt");

-- Note: RLS policies are already configured in scripts/03-fix-rls-policies.sql
-- No additional RLS policies needed for this migration
