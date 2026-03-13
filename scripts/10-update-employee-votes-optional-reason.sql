-- Update employee_votes table to make reason optional
-- This allows votes without a reason

ALTER TABLE employee_votes 
ALTER COLUMN reason DROP NOT NULL;
