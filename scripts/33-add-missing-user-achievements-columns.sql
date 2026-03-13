-- ============================================
-- Add missing columns to user_achievements table
-- ============================================
-- Fix for columns that may not exist if table was created before

DO $$
BEGIN
  -- Add "currentProgress" column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_achievements' 
    AND column_name = 'currentProgress'
  ) THEN
    ALTER TABLE user_achievements ADD COLUMN "currentProgress" INTEGER NOT NULL DEFAULT 1;
  END IF;

  -- Add "completed" column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_achievements' 
    AND column_name = 'completed'
  ) THEN
    ALTER TABLE user_achievements ADD COLUMN "completed" BOOLEAN NOT NULL DEFAULT false;
  END IF;

  -- Add "awardedBy" column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_achievements' 
    AND column_name = 'awardedBy'
  ) THEN
    ALTER TABLE user_achievements ADD COLUMN "awardedBy" UUID REFERENCES users(id) ON DELETE SET NULL;
  END IF;

  -- Add "awardedAt" column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_achievements' 
    AND column_name = 'awardedAt'
  ) THEN
    ALTER TABLE user_achievements ADD COLUMN "awardedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;
