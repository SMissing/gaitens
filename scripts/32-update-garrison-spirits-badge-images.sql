-- ============================================
-- Update Garrison and Spirits Shift achievements with badge images
-- ============================================

UPDATE achievements
SET "imageUrl" = '/badges/Badge_GarrisonShift.png'
WHERE name = 'Garrison Shift';

UPDATE achievements
SET "imageUrl" = '/badges/Badge_SpiritsShift.png'
WHERE name = 'Spirits Shift';
