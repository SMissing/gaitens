-- ============================================
-- Create barred_people table
-- ============================================
-- Stores barred list records:
-- - photo URL/path
-- - optional name
-- - reason for bar
-- - duration + calculated end date
-- Access control is handled in API routes (cookie session auth),
-- so RLS is disabled to match the rest of this project.
-- ============================================

CREATE TABLE IF NOT EXISTS barred_people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  "imageUrl" TEXT NOT NULL,
  "imagePath" TEXT NOT NULL,
  reason TEXT NOT NULL,
  "barDurationValue" INTEGER NOT NULL CHECK ("barDurationValue" > 0),
  "barDurationUnit" TEXT NOT NULL CHECK ("barDurationUnit" IN ('days', 'weeks', 'months', 'years')),
  "barEndDate" TIMESTAMP WITH TIME ZONE NOT NULL,
  "createdBy" UUID REFERENCES users(id) ON DELETE SET NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Helpful indexes for list sorting/filtering
CREATE INDEX IF NOT EXISTS idx_barred_people_created_at ON barred_people("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_barred_people_bar_end_date ON barred_people("barEndDate");
CREATE INDEX IF NOT EXISTS idx_barred_people_created_by ON barred_people("createdBy");

-- Keep behavior consistent with existing app tables
ALTER TABLE barred_people DISABLE ROW LEVEL SECURITY;

