-- ============================================
-- Reset all daily check-in data
-- ============================================
-- WARNING: This will delete ALL check-in records and streak data
-- Use this to start fresh with the check-in system
-- ============================================

-- Delete all daily check-ins
DELETE FROM daily_checkins;

-- Reset all user streaks
DELETE FROM user_streaks;

-- Optional: Also remove streak-related achievements from user_achievements
-- Uncomment the lines below if you want to remove streak badges from users as well
-- DELETE FROM user_achievements 
-- WHERE "achievementId" IN (
--   SELECT id FROM achievements 
--   WHERE name IN ('1-Day Streak', '7-Day Streak', '30-Day Streak', '100-Day Streak')
-- );

-- Verify the reset
SELECT 
  (SELECT COUNT(*) FROM daily_checkins) as checkin_count,
  (SELECT COUNT(*) FROM user_streaks) as streak_count;
