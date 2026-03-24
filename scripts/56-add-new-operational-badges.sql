-- ============================================
-- Add operational, venue, and training badges
-- ============================================
-- Skips duplicates already in DB: Know Circus, Know Labyrinth, Know Cabin,
-- Know Sharpshooters, Golf Master, Change Sodas, Clean Potwash.
-- imageUrl left NULL — add assets later.
-- Training badges: achievement name must match training_courses.title for
-- auto-award via POST /api/training/complete. Add new rows when new modules are added.
-- ============================================

INSERT INTO achievements (name, description, "requiresProgress", "requiredCount", rarity, "imageUrl") VALUES
  -- Venue / activities
  ('Karaoke', 'Knows how to run karaoke', false, 1, 'Common', NULL),
  ('Ice Curling', 'Knows how to operate ice curling', false, 1, 'Common', NULL),
  ('Footpool', 'Knows how to operate footpool', false, 1, 'Common', NULL),
  ('Darts', 'Knows how to operate darts', false, 1, 'Common', NULL),
  ('Shuffleboards', 'Knows how to operate shuffleboards', false, 1, 'Common', NULL),
  ('Axe Throwing', 'Knows how to operate axe throwing', false, 1, 'Epic', NULL),
  ('Beer Pong', 'Knows how to run beer pong', false, 1, 'Common', NULL),
  ('Cocktails Garrison', 'Knows Garrison cocktails', false, 1, 'Rare', NULL),
  ('Cocktails Bassment', 'Knows Bassment cocktails', false, 1, 'Rare', NULL),
  ('Cocktails Spirits', 'Knows Spirits cocktails', false, 1, 'Rare', NULL),
  ('Hosted a Bottomless', 'Hosted a bottomless event', false, 1, 'Rare', NULL),
  ('Review Garrison', 'Posted a review for Garrison', false, 1, 'Common', NULL),
  ('Review Bassment', 'Posted a review for Bassment', false, 1, 'Common', NULL),
  ('Review Spirits', 'Posted a review for Spirits', false, 1, 'Common', NULL),
  ('Kitchen Compliance', 'Met kitchen compliance standards', false, 1, 'Rare', NULL),
  ('Shot Person', 'Excelled as shot person', false, 1, 'Common', NULL),
  ('Perfect Host', 'Delivered outstanding hosting', false, 1, 'Epic', NULL),
  ('Radio Compliant', 'Radio compliance standards met', false, 1, 'Common', NULL),
  ('PDQ Wiz', 'Excelled on PDQ', false, 1, 'Rare', NULL),
  ('Toilet Checker', 'Excelled at toilet checks', false, 1, 'Common', NULL),
  ('Barback Superstar', 'Outstanding barback performance', false, 1, 'Rare', NULL),
  ('Potwash', 'Excelled in potwash', false, 1, 'Common', NULL),
  ('Clean Station', 'Maintained a clean station', false, 1, 'Common', NULL),
  -- Training completion (names must match training_courses.title)
  ('Dashboard Overview', 'Completed the Dashboard Overview training module', false, 1, 'Common', NULL),
  ('Hosting a Booking', 'Completed the Hosting a Booking training module', false, 1, 'Common', NULL),
  ('Sensor Location', 'Completed the Sensor Location training module', false, 1, 'Common', NULL),
  ('System Shutdown', 'Completed the System Shutdown training module', false, 1, 'Common', NULL),
  ('Allergen Awareness', 'Completed the Allergen Awareness training module', false, 1, 'Common', NULL),
  ('Manual Handling', 'Completed the Manual Handling training module', false, 1, 'Common', NULL)
  -- Personal Time --

ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  "requiresProgress" = EXCLUDED."requiresProgress",
  "requiredCount" = EXCLUDED."requiredCount",
  rarity = EXCLUDED.rarity,
  "updatedAt" = NOW();
