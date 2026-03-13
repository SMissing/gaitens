-- Create storage bucket for notice images
-- Run this in Supabase SQL Editor

-- Create the bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('notices', 'notices', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the notices bucket
-- Since we're using cookie-based auth, allow all operations on the notices bucket
-- Security is handled at the API route level (requireManager check)

-- Allow public read access
CREATE POLICY "Allow public read access to notice images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'notices');

-- Allow all authenticated operations (API handles authorization)
-- Note: In production, you may want to restrict this further
CREATE POLICY "Allow all operations on notices bucket"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'notices')
WITH CHECK (bucket_id = 'notices');
