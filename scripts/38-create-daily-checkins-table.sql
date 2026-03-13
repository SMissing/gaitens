-- ============================================
-- Create daily check-ins and streak tracking table
-- ============================================
-- Tracks daily check-ins and maintains streak counts
-- ============================================

-- Daily check-ins table
CREATE TABLE IF NOT EXISTS daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "checkInDate" DATE NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE("userId", "checkInDate")
);

-- User streak tracking table
CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  "currentStreak" INTEGER NOT NULL DEFAULT 0,
  "longestStreak" INTEGER NOT NULL DEFAULT 0,
  "lastCheckInDate" DATE,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user ON daily_checkins("userId");
CREATE INDEX IF NOT EXISTS idx_daily_checkins_date ON daily_checkins("checkInDate");
CREATE INDEX IF NOT EXISTS idx_user_streaks_user ON user_streaks("userId");

-- Disable Row Level Security - authentication is handled in the application layer
ALTER TABLE daily_checkins DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks DISABLE ROW LEVEL SECURITY;
