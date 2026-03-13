-- ============================================
-- Fix RLS Policies for Development
-- ============================================
-- This script creates permissive RLS policies to allow access
-- Run this AFTER creating tables and users
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow all users read access" ON users;
DROP POLICY IF EXISTS "Allow managers to manage users" ON users;
DROP POLICY IF EXISTS "Allow all users read access" ON holiday_requests;
DROP POLICY IF EXISTS "Allow users to create their own requests" ON holiday_requests;
DROP POLICY IF EXISTS "Allow managers to update requests" ON holiday_requests;
DROP POLICY IF EXISTS "Allow all users read access" ON holiday_calendar_events;
DROP POLICY IF EXISTS "Allow users to create events" ON holiday_calendar_events;
DROP POLICY IF EXISTS "Allow all users read access" ON training_courses;
DROP POLICY IF EXISTS "Allow managers to manage courses" ON training_courses;
DROP POLICY IF EXISTS "Allow all users read access" ON training_completions;
DROP POLICY IF EXISTS "Allow users to create completions" ON training_completions;
DROP POLICY IF EXISTS "Allow users to update their completions" ON training_completions;
DROP POLICY IF EXISTS "Allow all users read access" ON notices;
DROP POLICY IF EXISTS "Allow managers to manage notices" ON notices;
DROP POLICY IF EXISTS "Allow all users read access" ON grievances;
DROP POLICY IF EXISTS "Allow users to create grievances" ON grievances;
DROP POLICY IF EXISTS "Allow managers to update grievances" ON grievances;
DROP POLICY IF EXISTS "Allow all users read access" ON ideas;
DROP POLICY IF EXISTS "Allow users to create ideas" ON ideas;
DROP POLICY IF EXISTS "Allow managers to update ideas" ON ideas;
DROP POLICY IF EXISTS "Allow all users read access" ON employee_votes;
DROP POLICY IF EXISTS "Allow users to create votes" ON employee_votes;
DROP POLICY IF EXISTS "Allow users to update their own votes" ON employee_votes;
DROP POLICY IF EXISTS "Allow all users read access" ON employee_winners;
DROP POLICY IF EXISTS "Allow admins to manage winners" ON employee_winners;
DROP POLICY IF EXISTS "Allow all users read access" ON meetings;
DROP POLICY IF EXISTS "Allow managers to manage meetings" ON meetings;

-- Create permissive policies for development
-- NOTE: These allow full access. In production, you should create more restrictive policies.

-- Users table: Allow reading all users (needed for login)
CREATE POLICY "Allow all users read access" ON users
  FOR SELECT
  USING (true);

-- Users table: Allow managers/admins to insert/update
CREATE POLICY "Allow managers to manage users" ON users
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Holiday requests: Allow users to read their own, managers to read all
CREATE POLICY "Allow all users read access" ON holiday_requests
  FOR SELECT
  USING (true);

CREATE POLICY "Allow users to create their own requests" ON holiday_requests
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow managers to update requests" ON holiday_requests
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Holiday calendar events: Allow read access
CREATE POLICY "Allow all users read access" ON holiday_calendar_events
  FOR SELECT
  USING (true);

CREATE POLICY "Allow users to create events" ON holiday_calendar_events
  FOR INSERT
  WITH CHECK (true);

-- Training courses: Allow read access
CREATE POLICY "Allow all users read access" ON training_courses
  FOR SELECT
  USING (true);

CREATE POLICY "Allow managers to manage courses" ON training_courses
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Training completions: Allow read access
CREATE POLICY "Allow all users read access" ON training_completions
  FOR SELECT
  USING (true);

CREATE POLICY "Allow users to create completions" ON training_completions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow users to update their completions" ON training_completions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Notices: Allow read access
CREATE POLICY "Allow all users read access" ON notices
  FOR SELECT
  USING (true);

CREATE POLICY "Allow managers to manage notices" ON notices
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grievances: Allow users to read their own, managers to read all
CREATE POLICY "Allow all users read access" ON grievances
  FOR SELECT
  USING (true);

CREATE POLICY "Allow users to create grievances" ON grievances
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow managers to update grievances" ON grievances
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Ideas: Allow read access
CREATE POLICY "Allow all users read access" ON ideas
  FOR SELECT
  USING (true);

CREATE POLICY "Allow users to create ideas" ON ideas
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow managers to update ideas" ON ideas
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Employee votes: Allow read access
CREATE POLICY "Allow all users read access" ON employee_votes
  FOR SELECT
  USING (true);

CREATE POLICY "Allow users to create votes" ON employee_votes
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow users to update their own votes" ON employee_votes
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Employee winners: Allow read access
CREATE POLICY "Allow all users read access" ON employee_winners
  FOR SELECT
  USING (true);

CREATE POLICY "Allow admins to manage winners" ON employee_winners
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Meetings: Allow read access
CREATE POLICY "Allow all users read access" ON meetings
  FOR SELECT
  USING (true);

CREATE POLICY "Allow managers to manage meetings" ON meetings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- RLS Policies created successfully!
-- ============================================
-- These policies allow full access for development
-- You should tighten these in production based on user roles
-- ============================================
