-- ============================================
-- Allow permanent ("life") barred entries
-- ============================================
-- Adds 'life' to barDurationUnit. Life bars store barDurationValue as 1 (placeholder)
-- and a far-future barEndDate so they stay in the active list until manually removed.
-- Run after scripts/54-create-barred-people-table.sql
--
-- Postgres folds unquoted identifiers to lowercase, so DROP CONSTRAINT foo_bar checks
-- foo_bar in lowercase. If the constraint was created with a quoted mixed-case name
-- (e.g. Supabase / script tooling), you must drop it with double quotes.
-- ============================================

ALTER TABLE public.barred_people
  DROP CONSTRAINT IF EXISTS barred_people_bardurationunit_check;

ALTER TABLE public.barred_people
  DROP CONSTRAINT IF EXISTS barred_people_barDurationUnit_check;

ALTER TABLE public.barred_people
  DROP CONSTRAINT IF EXISTS "barred_people_barDurationUnit_check";

-- Drop our v2 constraint if re-running this migration
ALTER TABLE public.barred_people
  DROP CONSTRAINT IF EXISTS barred_people_bar_duration_unit_values_check;

ALTER TABLE public.barred_people
  ADD CONSTRAINT barred_people_bar_duration_unit_values_check
  CHECK ("barDurationUnit" IN ('days', 'weeks', 'months', 'years', 'life'));
