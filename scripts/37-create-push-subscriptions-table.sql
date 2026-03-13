-- ============================================
-- Create push notification subscriptions table
-- ============================================
-- Stores push notification subscriptions for users
-- Allows sending notifications even when app is closed
-- ============================================

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "subscription" JSONB NOT NULL, -- Web Push API subscription object
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE("userId", "subscription")
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions("userId");

-- Disable Row Level Security - authentication is handled in the application layer
ALTER TABLE push_subscriptions DISABLE ROW LEVEL SECURITY;
