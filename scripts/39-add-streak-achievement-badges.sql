-- ============================================
-- Add streak achievement badges
-- ============================================
-- Creates achievement badges for daily check-in streaks
-- ============================================

-- Insert streak achievement badges with rarity
INSERT INTO achievements (name, description, "requiresProgress", "requiredCount", "imageUrl", rarity) VALUES
  ('1-Day Streak', 'Welcome! You checked in for your first day', false, 1, '/badges/Badge_1day.png', 'Common'),
  ('7-Day Streak', 'Checked in for 7 consecutive days', true, 7, '/badges/Badge_7days.png', 'Rare'),
  ('30-Day Streak', 'Checked in for 30 consecutive days', true, 30, '/badges/Badge_30days.png', 'Epic'),
  ('100-Day Streak', 'Checked in for 100 consecutive days', true, 100, '/badges/Badge_100days.png', 'Legendary')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  "requiresProgress" = EXCLUDED."requiresProgress",
  "requiredCount" = EXCLUDED."requiredCount",
  "imageUrl" = EXCLUDED."imageUrl",
  rarity = EXCLUDED.rarity,
  "updatedAt" = NOW();
