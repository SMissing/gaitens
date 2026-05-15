-- Create storage bucket for idea images
-- Run this in Supabase SQL Editor

INSERT INTO storage.buckets (id, name, public)
VALUES ('ideas', 'ideas', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public read access to idea images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'ideas');

CREATE POLICY "Allow all operations on ideas bucket"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'ideas')
WITH CHECK (bucket_id = 'ideas');
