-- ============================================
-- Update Ice Machine and Cocktail Expert achievements with badge images
-- ============================================

UPDATE achievements
SET "imageUrl" = '/badges/Badge_IceMachine.png'
WHERE name = 'Clean Ice Machine' OR name LIKE '%ice machine%';

UPDATE achievements
SET "imageUrl" = '/badges/Badge_CocktailExpert.png'
WHERE name = 'Cocktail Expert' OR name LIKE '%cocktail%';
