-- ============================================
-- Add new badges from notes.txt
-- ============================================
-- Adds operational and engagement badges
-- ============================================

-- Insert new achievement badges
INSERT INTO achievements (name, description, "requiresProgress", "requiredCount", rarity) VALUES
  ('Line Clean', 'Completed a line clean', false, 1, 'Common'),
  ('Change a Keg', 'Successfully changed a keg', false, 1, 'Common'),
  ('Change Gas', 'Successfully changed gas', false, 1, 'Common'),
  ('Clean Potwash', 'Completed cleaning the potwash', false, 1, 'Common'),
  ('Change Sodas', 'Successfully changed sodas', false, 1, 'Common'),
  ('Post a Review', 'Posted a customer review', true, 3, 'Rare'),
  ('Have a 5 Star review naming yourself', 'Received a 5-star review that mentions your name', false, 1, 'Epic'),
  ('Share an Event', 'Shared an upcoming event', false, 1, 'Common'),
  ('Follow Us', 'Followed us on social media', true, 3, 'Rare'),
  ('Golf Master', 'Mastered the golf game', false, 1, 'Epic')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  "requiresProgress" = EXCLUDED."requiresProgress",
  "requiredCount" = EXCLUDED."requiredCount",
  rarity = EXCLUDED.rarity,
  "updatedAt" = NOW();
