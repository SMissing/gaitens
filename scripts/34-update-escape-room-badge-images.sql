-- ============================================
-- Update Escape Room achievements with badge images
-- ============================================

UPDATE achievements
SET "imageUrl" = '/badges/Badge_Circus.png'
WHERE name = 'Circus';

UPDATE achievements
SET "imageUrl" = '/badges/Badge_Labyrinth.png'
WHERE name = 'Labyrinth';

UPDATE achievements
SET "imageUrl" = '/badges/Badge_Cabin.png'
WHERE name = 'Cabin';
