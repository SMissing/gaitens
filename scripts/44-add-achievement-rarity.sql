-- ============================================
-- Add rarity system to achievements
-- ============================================
-- Adds rarity levels: Common, Rare, Epic, Legendary
-- ============================================

-- Add rarity column to achievements table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'achievements' 
    AND column_name = 'rarity'
  ) THEN
    ALTER TABLE achievements ADD COLUMN rarity TEXT DEFAULT 'Common' CHECK (rarity IN ('Common', 'Rare', 'Epic', 'Legendary'));
  END IF;
END $$;

-- Set rarities for existing achievements
-- Common: Basic achievements
UPDATE achievements SET rarity = 'Common' WHERE rarity IS NULL OR rarity = 'Common';

-- Rare: 7-day streak, shift-based achievements
UPDATE achievements SET rarity = 'Rare' 
WHERE name IN ('7-Day Streak', 'Work a shift at Spirits', 'Work a shift at Garrison', 'Work a shift at Bassment');

-- Epic: 30-day streak, venue knowledge achievements
UPDATE achievements SET rarity = 'Epic' 
WHERE name IN ('30-Day Streak', 'Know Circus', 'Know Labyrinth', 'Know Cabin', 'Know Sharpshooters', 'Cocktail Expert');

-- Legendary: 100-day streak, special achievements
UPDATE achievements SET rarity = 'Legendary' 
WHERE name IN ('100-Day Streak');

-- Welcome badge is Common
UPDATE achievements SET rarity = 'Common' WHERE name = '1-Day Streak';

-- Clean the ice machine could be Rare
UPDATE achievements SET rarity = 'Rare' WHERE name = 'Clean the ice machine';
