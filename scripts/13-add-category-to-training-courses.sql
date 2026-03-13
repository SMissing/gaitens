-- Add category column to training_courses table
ALTER TABLE training_courses 
ADD COLUMN IF NOT EXISTS category TEXT;

-- Add index for category filtering
CREATE INDEX IF NOT EXISTS idx_training_courses_category ON training_courses(category);
