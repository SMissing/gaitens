-- ============================================
-- Fix meetings table column names if table exists with wrong casing
-- ============================================

-- Check if table exists and has lowercase columns, if so rename them
DO $$
BEGIN
  -- Check if requestedby column exists (lowercase)
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'meetings' 
    AND column_name = 'requestedby'
  ) THEN
    ALTER TABLE meetings RENAME COLUMN requestedby TO "requestedBy";
  END IF;

  -- Check if requestedfor column exists (lowercase)
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'meetings' 
    AND column_name = 'requestedfor'
  ) THEN
    ALTER TABLE meetings RENAME COLUMN requestedfor TO "requestedFor";
  END IF;

  -- Check if suggesteddate column exists (lowercase)
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'meetings' 
    AND column_name = 'suggesteddate'
  ) THEN
    ALTER TABLE meetings RENAME COLUMN suggesteddate TO "suggestedDate";
  END IF;

  -- Check if suggestedtime column exists (lowercase)
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'meetings' 
    AND column_name = 'suggestedtime'
  ) THEN
    ALTER TABLE meetings RENAME COLUMN suggestedtime TO "suggestedTime";
  END IF;

  -- Check if meetingdate column exists (lowercase)
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'meetings' 
    AND column_name = 'meetingdate'
  ) THEN
    ALTER TABLE meetings RENAME COLUMN meetingdate TO "meetingDate";
  END IF;

  -- Check if meetingtime column exists (lowercase)
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'meetings' 
    AND column_name = 'meetingtime'
  ) THEN
    ALTER TABLE meetings RENAME COLUMN meetingtime TO "meetingTime";
  END IF;

  -- Check if reschedulereason column exists (lowercase)
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'meetings' 
    AND column_name = 'reschedulereason'
  ) THEN
    ALTER TABLE meetings RENAME COLUMN reschedulereason TO "rescheduleReason";
  END IF;

  -- Check if lastactionby column exists (lowercase)
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'meetings' 
    AND column_name = 'lastactionby'
  ) THEN
    ALTER TABLE meetings RENAME COLUMN lastactionby TO "lastActionBy";
  END IF;

  -- Check if createdat column exists (lowercase)
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'meetings' 
    AND column_name = 'createdat'
  ) THEN
    ALTER TABLE meetings RENAME COLUMN createdat TO "createdAt";
  END IF;

  -- Check if updatedat column exists (lowercase)
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'meetings' 
    AND column_name = 'updatedat'
  ) THEN
    ALTER TABLE meetings RENAME COLUMN updatedat TO "updatedAt";
  END IF;
END $$;
