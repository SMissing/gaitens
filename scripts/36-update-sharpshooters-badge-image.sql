-- ============================================
-- Update Sharpshooters achievement with badge image
-- ============================================

UPDATE achievements
SET "imageUrl" = '/badges/Badge_Sharpshooters.png'
WHERE name = 'Sharpshooters' OR name LIKE '%sharpshooters%';
