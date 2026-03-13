-- ============================================
-- Add image columns to upcoming_events table
-- ============================================

ALTER TABLE upcoming_events
ADD COLUMN IF NOT EXISTS "imageUrl" TEXT,
ADD COLUMN IF NOT EXISTS "imagePath" TEXT;
