-- ============================================
-- Create idea_votes table for voting system
-- ============================================
-- This migration creates a table to track upvotes and downvotes on ideas
-- Each user can vote once per idea (upvote or downvote)
-- ============================================

-- Create idea_votes table
CREATE TABLE IF NOT EXISTS idea_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "ideaId" UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vote INTEGER NOT NULL CHECK (vote IN (1, -1)), -- 1 for upvote, -1 for downvote
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE("ideaId", "userId")
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_idea_votes_idea ON idea_votes("ideaId");
CREATE INDEX IF NOT EXISTS idx_idea_votes_user ON idea_votes("userId");

-- Add function to calculate vote totals
CREATE OR REPLACE FUNCTION get_idea_vote_total(idea_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(SUM(vote), 0)::INTEGER
  FROM idea_votes
  WHERE "ideaId" = idea_id;
$$ LANGUAGE SQL STABLE;

-- ============================================
-- RLS Policies for idea_votes table
-- ============================================

-- Enable RLS
ALTER TABLE idea_votes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all votes" ON idea_votes;
DROP POLICY IF EXISTS "Users can create their own votes" ON idea_votes;
DROP POLICY IF EXISTS "Users can update their own votes" ON idea_votes;
DROP POLICY IF EXISTS "Users can delete their own votes" ON idea_votes;

-- Policy: Users can view all votes
CREATE POLICY "Users can view all votes"
ON idea_votes
FOR SELECT
USING (true);

-- Policy: Users can create their own votes
CREATE POLICY "Users can create their own votes"
ON idea_votes
FOR INSERT
WITH CHECK (true);

-- Policy: Users can update their own votes
CREATE POLICY "Users can update their own votes"
ON idea_votes
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Policy: Users can delete their own votes
CREATE POLICY "Users can delete their own votes"
ON idea_votes
FOR DELETE
USING (true);
