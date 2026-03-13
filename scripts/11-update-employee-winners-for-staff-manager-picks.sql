-- Update employee_winners table to support staff pick and manager pick
-- Add a type field to distinguish between staff pick and manager pick

ALTER TABLE employee_winners 
ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'staff_pick' CHECK (type IN ('staff_pick', 'manager_pick'));

-- Remove the unique constraint on month since we can have two winners per month
ALTER TABLE employee_winners 
DROP CONSTRAINT IF EXISTS employee_winners_month_key;

-- Add a unique constraint on (month, type) to ensure one staff pick and one manager pick per month
CREATE UNIQUE INDEX IF NOT EXISTS idx_employee_winners_month_type ON employee_winners(month, type);
