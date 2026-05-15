-- Add optional image fields to ideas table
-- Run this in Supabase SQL Editor

ALTER TABLE ideas
  ADD COLUMN IF NOT EXISTS "imageUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "imagePath" TEXT;
