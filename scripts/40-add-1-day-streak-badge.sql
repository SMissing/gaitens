-- ============================================
-- Add 1-Day Streak badge (if not already added)
-- ============================================
-- This ensures the 1-day welcome badge exists in the database
-- ============================================

-- Insert the 1-Day Streak badge (will not insert if it already exists)
INSERT INTO achievements (name, description, "requiresProgress", "requiredCount", "imageUrl") VALUES
  ('1-Day Streak', 'Welcome! You checked in for your first day', false, 1, '/badges/Badge_1day.png')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  "requiresProgress" = EXCLUDED."requiresProgress",
  "requiredCount" = EXCLUDED."requiredCount",
  "imageUrl" = EXCLUDED."imageUrl",
  "updatedAt" = NOW();
