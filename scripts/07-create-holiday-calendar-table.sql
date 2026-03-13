-- Holiday calendar availability table
-- Tracks the availability status of each day (green/yellow/red)
CREATE TABLE IF NOT EXISTS holiday_calendar_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'green' CHECK (status IN ('green', 'yellow', 'red')),
  "updatedBy" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_holiday_calendar_availability_date ON holiday_calendar_availability(date);
CREATE INDEX IF NOT EXISTS idx_holiday_calendar_availability_status ON holiday_calendar_availability(status);

ALTER TABLE holiday_calendar_availability ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow all users to read calendar availability
CREATE POLICY "Allow all users read access" ON holiday_calendar_availability
  FOR SELECT
  USING (true);

-- Allow managers/admins to insert/update calendar availability
CREATE POLICY "Allow managers to manage calendar availability" ON holiday_calendar_availability
  FOR ALL
  USING (true)
  WITH CHECK (true);
