-- Update training_courses table to support site assignment
-- Add site column and createdBy column for tracking who created the module

ALTER TABLE training_courses 
ADD COLUMN IF NOT EXISTS site TEXT,
ADD COLUMN IF NOT EXISTS "createdBy" UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS "moduleType" TEXT DEFAULT 'video' CHECK ("moduleType" IN ('video', 'text', 'guide')),
ADD COLUMN IF NOT EXISTS "duration" INTEGER, -- Duration in minutes
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;

-- Add index for site filtering
CREATE INDEX IF NOT EXISTS idx_training_courses_site ON training_courses(site);
CREATE INDEX IF NOT EXISTS idx_training_courses_active ON training_courses(active);

-- Update training_completions to track completion better
ALTER TABLE training_completions
ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid();

-- Add index for faster lookups (we'll handle expiration logic in application code)
CREATE INDEX IF NOT EXISTS idx_training_completions_user_course 
ON training_completions("userId", "courseId");

CREATE INDEX IF NOT EXISTS idx_training_completions_expires 
ON training_completions("expiresAt");
