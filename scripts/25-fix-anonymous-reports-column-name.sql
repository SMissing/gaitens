-- ============================================
-- Fix anonymous_reports column name
-- ============================================
-- If the table was created with lowercase reportdate, this will fix it
-- ============================================

-- Drop the index if it exists (it might fail if column doesn't exist)
DROP INDEX IF EXISTS idx_anonymous_reports_report_date;

-- Check if column exists as lowercase and rename it
DO $$
BEGIN
  -- Check if reportdate (lowercase) exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'anonymous_reports' 
    AND column_name = 'reportdate'
  ) THEN
    -- Rename to quoted camelCase
    ALTER TABLE anonymous_reports RENAME COLUMN reportdate TO "reportDate";
  END IF;
END $$;

-- Recreate the index with correct column name
CREATE INDEX IF NOT EXISTS idx_anonymous_reports_report_date ON anonymous_reports("reportDate" DESC);
