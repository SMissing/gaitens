-- ============================================
-- Create photo_albums table
-- ============================================
-- Stores metadata about photos uploaded to the photo album
-- Only admins can upload photos
-- All authenticated users can view photos
-- ============================================

CREATE TABLE IF NOT EXISTS photo_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "imageUrl" TEXT NOT NULL,
  "imagePath" TEXT NOT NULL,
  title TEXT,
  description TEXT,
  "weekendDate" DATE,
  "uploadedBy" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_photo_albums_weekend_date ON photo_albums("weekendDate");
CREATE INDEX IF NOT EXISTS idx_photo_albums_created_at ON photo_albums("createdAt" DESC);

-- Enable RLS
ALTER TABLE photo_albums ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view photos
CREATE POLICY "Allow all authenticated users to view photos"
ON photo_albums
FOR SELECT
TO authenticated
USING (true);

-- Policy: Only admins can insert photos
CREATE POLICY "Only admins can insert photos"
ON photo_albums
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Policy: Only admins can update photos
CREATE POLICY "Only admins can update photos"
ON photo_albums
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Policy: Only admins can delete photos
CREATE POLICY "Only admins can delete photos"
ON photo_albums
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);
