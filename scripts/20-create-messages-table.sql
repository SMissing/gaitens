-- Create messages table for group chat
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient message retrieval
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages("createdAt" DESC);

-- Disable Row Level Security - authentication is handled in the application layer
-- All authenticated users (verified via API routes) can access messages
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
