-- ============================================
-- Update streak badge image URLs
-- ============================================
-- Ensures all streak badges have the correct image paths
-- ============================================

-- Update streak achievement badge images
UPDATE achievements 
SET 
  "imageUrl" = '/badges/Badge_1day.png',
  "updatedAt" = NOW()
WHERE name = '1-Day Streak';

UPDATE achievements 
SET 
  "imageUrl" = '/badges/Badge_7days.png',
  "updatedAt" = NOW()
WHERE name = '7-Day Streak';

UPDATE achievements 
SET 
  "imageUrl" = '/badges/Badge_30days.png',
  "updatedAt" = NOW()
WHERE name = '30-Day Streak';

UPDATE achievements 
SET 
  "imageUrl" = '/badges/Badge_100days.png',
  "updatedAt" = NOW()
WHERE name = '100-Day Streak';

-- Verify the updates
SELECT name, "imageUrl", "requiresProgress", "requiredCount" 
FROM achievements 
WHERE name IN ('1-Day Streak', '7-Day Streak', '30-Day Streak', '100-Day Streak')
ORDER BY "requiredCount";
