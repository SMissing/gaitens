-- ============================================
-- Fix awardedBy column to allow NULL values
-- ============================================
-- System-awarded achievements (like streak badges) don't have an awardedBy user
-- ============================================

-- Make awardedBy nullable if it isn't already
DO $$
BEGIN
  -- Check if the column exists and is NOT NULL
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'user_achievements' 
    AND column_name = 'awardedBy'
    AND is_nullable = 'NO'
  ) THEN
    -- Alter the column to allow NULL
    ALTER TABLE user_achievements 
    ALTER COLUMN "awardedBy" DROP NOT NULL;
    
    RAISE NOTICE 'Column awardedBy is now nullable';
  ELSE
    RAISE NOTICE 'Column awardedBy is already nullable or does not exist';
  END IF;
END $$;
