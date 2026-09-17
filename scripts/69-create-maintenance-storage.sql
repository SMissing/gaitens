-- Create storage bucket for maintenance shift photos
-- Run this in Supabase SQL Editor

INSERT INTO storage.buckets (id, name, public)
VALUES ('maintenance', 'maintenance', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public read access to maintenance photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'maintenance');

CREATE POLICY "Allow all operations on maintenance bucket"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'maintenance')
WITH CHECK (bucket_id = 'maintenance');
