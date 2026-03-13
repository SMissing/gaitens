-- ============================================
-- Create achievements system tables
-- ============================================
-- Badges that can be awarded to staff members
-- Some badges require multiple awards to complete (progress-based)
-- ============================================

-- Achievements/Badges definition table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  "imageUrl" TEXT, -- URL to badge image (will be added later)
  "requiresProgress" BOOLEAN NOT NULL DEFAULT false,
  "requiredCount" INTEGER DEFAULT 1, -- For progress-based badges (e.g., 5 shifts = 5)
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if they don't exist (for tables created before these columns were added)
DO $$
BEGIN
  -- Add "requiresProgress" column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'achievements' 
    AND column_name = 'requiresProgress'
  ) THEN
    ALTER TABLE achievements ADD COLUMN "requiresProgress" BOOLEAN NOT NULL DEFAULT false;
  END IF;

  -- Add "requiredCount" column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'achievements' 
    AND column_name = 'requiredCount'
  ) THEN
    ALTER TABLE achievements ADD COLUMN "requiredCount" INTEGER DEFAULT 1;
  END IF;

  -- Add "imageUrl" column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'achievements' 
    AND column_name = 'imageUrl'
  ) THEN
    ALTER TABLE achievements ADD COLUMN "imageUrl" TEXT;
  END IF;

  -- Add "updatedAt" column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'achievements' 
    AND column_name = 'updatedAt'
  ) THEN
    ALTER TABLE achievements ADD COLUMN "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- User achievements - tracks which users have which badges and their progress
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "achievementId" UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  "currentProgress" INTEGER NOT NULL DEFAULT 1,
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "awardedBy" UUID REFERENCES users(id) ON DELETE SET NULL, -- Manager/admin who awarded it
  "awardedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE("userId", "achievementId")
);

-- Add "completed" column if it doesn't exist (for tables created before this column was added)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_achievements' 
    AND column_name = 'completed'
  ) THEN
    ALTER TABLE user_achievements ADD COLUMN "completed" BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements("userId");
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement ON user_achievements("achievementId");
CREATE INDEX IF NOT EXISTS idx_user_achievements_completed ON user_achievements("completed");

-- Disable Row Level Security - authentication is handled in the application layer
ALTER TABLE achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements DISABLE ROW LEVEL SECURITY;

-- Insert initial achievements
INSERT INTO achievements (name, description, "requiresProgress", "requiredCount") VALUES
  ('Clean the ice machine', 'Successfully cleaned the ice machine', false, 1),
  ('Know Circus', 'Knows how to operate the Circus escape room', false, 1),
  ('Know Labyrinth', 'Knows how to operate the Labyrinth escape room', false, 1),
  ('Know Cabin', 'Knows how to operate the Cabin escape room', false, 1),
  ('Know Sharpshooters', 'Knows how to operate Sharpshooters', false, 1),
  ('Work a shift at Spirits', 'Worked a shift at Spirits venue', true, 5),
  ('Work a shift at Garrison', 'Worked a shift at Garrison venue', true, 5),
  ('Work a shift at Bassment', 'Worked a shift at Bassment venue', true, 5),
  ('Cocktail Expert', 'Knows the cocktails of each venue', true, 3)
ON CONFLICT (name) DO NOTHING;
