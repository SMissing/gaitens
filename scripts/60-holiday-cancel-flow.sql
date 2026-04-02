-- Holiday withdrawals and cancellation requests (see holidays UX: withdraw pending; request cancel on approved → admin queue).

ALTER TABLE holiday_requests DROP CONSTRAINT IF EXISTS holiday_requests_status_check;

ALTER TABLE holiday_requests
  ADD CONSTRAINT holiday_requests_status_check
  CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'));

ALTER TABLE holiday_requests
  ADD COLUMN IF NOT EXISTS "cancellationRequestedAt" TIMESTAMPTZ;

COMMENT ON COLUMN holiday_requests."cancellationRequestedAt" IS 'When set, staff asked to cancel an approved holiday; admins resolve via cancellation review.';
