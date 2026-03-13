-- ============================================
-- Create disciplinaries table
-- ============================================
-- This migration creates a table to track disciplinaries for staff members
-- Each staff member starts with 3 hearts, and each disciplinary breaks one heart
-- ============================================

-- Create disciplinaries table
CREATE TABLE IF NOT EXISTS disciplinaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "createdBy" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_disciplinaries_user ON disciplinaries("userId");
CREATE INDEX IF NOT EXISTS idx_disciplinaries_created_by ON disciplinaries("createdBy");
CREATE INDEX IF NOT EXISTS idx_disciplinaries_created_at ON disciplinaries("createdAt");

-- ============================================
-- RLS Policies for disciplinaries table
-- ============================================

-- Enable RLS
ALTER TABLE disciplinaries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all disciplinaries" ON disciplinaries;
DROP POLICY IF EXISTS "Admins can create disciplinaries" ON disciplinaries;

-- Policy: Only admins can view disciplinaries
CREATE POLICY "Admins can view all disciplinaries"
ON disciplinaries
FOR SELECT
USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

-- Policy: Only admins can create disciplinaries
CREATE POLICY "Admins can create disciplinaries"
ON disciplinaries
FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));
