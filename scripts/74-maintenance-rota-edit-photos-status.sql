-- ============================================
-- Maintenance rota: job photos + done / not done tracking
-- ============================================
-- photos            Reference images an admin attaches to the job (public URLs
--                   in the existing 'maintenance' storage bucket).
-- status            pending | done | not_done — set by the person rota'd on
--                   the job (or an admin) so the team can see what's
--                   outstanding from previous days.
-- completionNotes   What was done, or why it couldn't be done.
-- completedById/At  Who marked it and when.
-- ============================================

ALTER TABLE maintenance_rota
  ADD COLUMN IF NOT EXISTS photos TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'done', 'not_done')),
  ADD COLUMN IF NOT EXISTS "completionNotes" TEXT,
  ADD COLUMN IF NOT EXISTS "completedById" UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP WITH TIME ZONE;
