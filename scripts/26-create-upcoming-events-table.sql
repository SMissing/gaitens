-- ============================================
-- Create upcoming_events table
-- ============================================
-- Managers and admins can create upcoming events
-- All users can view upcoming events
-- ============================================

CREATE TABLE IF NOT EXISTS upcoming_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  "eventDate" DATE NOT NULL,
  "eventTime" TIME,
  location TEXT,
  "createdBy" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_upcoming_events_event_date ON upcoming_events("eventDate" DESC);
CREATE INDEX IF NOT EXISTS idx_upcoming_events_created_at ON upcoming_events("createdAt" DESC);

-- Disable Row Level Security - authentication is handled in the application layer
-- All authenticated users (verified via API routes) can access events
ALTER TABLE upcoming_events DISABLE ROW LEVEL SECURITY;
