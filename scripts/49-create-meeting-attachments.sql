-- ============================================
-- Meeting attachments (secondary feature)
-- ============================================

DROP TABLE IF EXISTS meeting_attachments CASCADE;

CREATE TABLE meeting_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,

  file_name TEXT NOT NULL,
  mime_type TEXT,
  storage_path TEXT NOT NULL, -- path inside storage bucket

  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_meeting_attachments_meeting_id ON meeting_attachments(meeting_id);
CREATE INDEX idx_meeting_attachments_created_at ON meeting_attachments(created_at);

ALTER TABLE meeting_attachments DISABLE ROW LEVEL SECURITY;

-- Storage bucket for meeting attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('meeting-attachments', 'meeting-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to download links.
-- We rely on API routes to restrict who can upload/delete.
CREATE POLICY "Allow public read access to meeting attachments"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'meeting-attachments');

-- Allow authenticated users to upload/remove; API authorization is handled in code.
CREATE POLICY "Allow all operations on meeting-attachments bucket"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'meeting-attachments')
WITH CHECK (bucket_id = 'meeting-attachments');

