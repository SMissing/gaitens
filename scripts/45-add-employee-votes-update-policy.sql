-- ============================================
-- Add UPDATE policy for employee_votes table
-- ============================================
-- This allows users to update their own votes
-- ============================================

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow users to update their own votes" ON employee_votes;

-- Create UPDATE policy for employee_votes
CREATE POLICY "Allow users to update their own votes" ON employee_votes
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
