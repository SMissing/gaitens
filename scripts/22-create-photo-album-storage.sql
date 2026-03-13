-- Create storage bucket for photo album images
-- Run this in Supabase SQL Editor

-- Create the bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('photo-albums', 'photo-albums', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the photo-albums bucket
-- Security is handled at the API route level (requireAdmin check)

-- Allow public read access
CREATE POLICY "Allow public read access to photo album images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'photo-albums');

-- Allow all authenticated operations (API handles authorization)
-- Note: In production, you may want to restrict this further
CREATE POLICY "Allow all operations on photo-albums bucket"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'photo-albums')
WITH CHECK (bucket_id = 'photo-albums');
