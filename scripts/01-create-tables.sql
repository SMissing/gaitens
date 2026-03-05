-- ============================================
-- Gaitens Leisure Group - Staff Portal
-- Database Schema Setup
-- ============================================
-- Run this script in Supabase SQL Editor to create all required tables
-- ============================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  "staffCode" TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('staff', 'manager', 'admin')),
  site TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE
);

-- Holiday requests table
CREATE TABLE IF NOT EXISTS holiday_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "startDate" DATE NOT NULL,
  "endDate" DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reason TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Holiday calendar events table
CREATE TABLE IF NOT EXISTS holiday_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('holiday', 'approved_request')),
  title TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training courses table
CREATE TABLE IF NOT EXISTS training_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  "videoUrl" TEXT,
  content TEXT,
  "quizQuestions" JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training completions table
CREATE TABLE IF NOT EXISTS training_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "courseId" UUID NOT NULL REFERENCES training_courses(id) ON DELETE CASCADE,
  "completedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  score INTEGER
);

-- Notices table
CREATE TABLE IF NOT EXISTS notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  attachments TEXT[],
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "expiresAt" TIMESTAMP WITH TIME ZONE,
  pinned BOOLEAN DEFAULT FALSE,
  "createdBy" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Grievances table
CREATE TABLE IF NOT EXISTS grievances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'in_review', 'resolved')),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ideas table
CREATE TABLE IF NOT EXISTS ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'implemented', 'rejected')),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employee votes table
CREATE TABLE IF NOT EXISTS employee_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "voterId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "nomineeId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  month TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE("voterId", month)
);

-- Employee winners table
CREATE TABLE IF NOT EXISTS employee_winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "createdBy" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  attendees UUID[] NOT NULL,
  notes TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Create indexes for better performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_staff_code ON users("staffCode");
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);
CREATE INDEX IF NOT EXISTS idx_holiday_requests_user ON holiday_requests("userId");
CREATE INDEX IF NOT EXISTS idx_holiday_requests_status ON holiday_requests(status);
CREATE INDEX IF NOT EXISTS idx_holiday_calendar_events_date ON holiday_calendar_events(date);
CREATE INDEX IF NOT EXISTS idx_training_completions_user ON training_completions("userId");
CREATE INDEX IF NOT EXISTS idx_training_completions_expires ON training_completions("expiresAt");
CREATE INDEX IF NOT EXISTS idx_notices_expires ON notices("expiresAt");
CREATE INDEX IF NOT EXISTS idx_notices_pinned ON notices(pinned);
CREATE INDEX IF NOT EXISTS idx_grievances_user ON grievances("userId");
CREATE INDEX IF NOT EXISTS idx_grievances_status ON grievances(status);
CREATE INDEX IF NOT EXISTS idx_ideas_user ON ideas("userId");
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_employee_votes_month ON employee_votes(month);
CREATE INDEX IF NOT EXISTS idx_employee_winners_month ON employee_winners(month);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(date);

-- ============================================
-- Enable Row Level Security (RLS)
-- ============================================
-- Note: You may want to configure RLS policies based on your security requirements
-- For now, we'll enable RLS but leave policies open for development
-- You can add policies later as needed

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE holiday_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE holiday_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE grievances ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Basic RLS Policies (allow all for now)
-- ============================================
-- These are permissive policies for development
-- You should tighten these based on your security requirements

-- Allow all operations for authenticated users (you'll need to adjust based on your auth setup)
-- For now, we'll create policies that allow service role access
-- In production, you'll want to create proper policies based on user roles

-- Example: Allow all users to read their own data
-- CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid() = id);

-- ============================================
-- Schema creation complete!
-- ============================================
