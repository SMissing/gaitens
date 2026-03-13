-- Add rejectionReason field to holiday_requests table
-- This allows admins to provide an optional reason when rejecting holiday requests

ALTER TABLE holiday_requests 
ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;
