-- ============================================
-- Fix RLS policies for photo_albums table
-- ============================================
-- This app uses cookie-based auth, not Supabase JWT auth
-- So auth.uid() will be null. We need to disable RLS
-- and handle authentication at the API route level instead
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all authenticated users to view photos" ON photo_albums;
DROP POLICY IF EXISTS "Only admins can insert photos" ON photo_albums;
DROP POLICY IF EXISTS "Only admins can update photos" ON photo_albums;
DROP POLICY IF EXISTS "Only admins can delete photos" ON photo_albums;

-- Disable RLS - authentication is handled in the application layer
-- All authenticated users (verified via API routes) can access photos
ALTER TABLE photo_albums DISABLE ROW LEVEL SECURITY;
