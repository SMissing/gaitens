-- ============================================
-- Add UPDATE policy for training_completions
-- ============================================
-- This fixes the issue where users cannot update existing training completions
-- when re-completing a training module
-- ============================================

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow users to update their completions" ON training_completions;

-- Create UPDATE policy for training_completions
CREATE POLICY "Allow users to update their completions" ON training_completions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
