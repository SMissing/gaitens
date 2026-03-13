-- ============================================
-- Create anonymous_reports table
-- ============================================
-- Staff can submit anonymous reports (no user ID stored)
-- Only admins can view and manage reports
-- ============================================

CREATE TABLE IF NOT EXISTS anonymous_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note TEXT NOT NULL,
  "reportDate" DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'in_review', 'resolved')),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_anonymous_reports_status ON anonymous_reports(status);
CREATE INDEX IF NOT EXISTS idx_anonymous_reports_created_at ON anonymous_reports("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_anonymous_reports_report_date ON anonymous_reports("reportDate" DESC);

-- Disable Row Level Security - authentication is handled in the application layer
-- All authenticated users (verified via API routes) can access reports
ALTER TABLE anonymous_reports DISABLE ROW LEVEL SECURITY;
