-- Notice reads table - tracks which notices each user has read
CREATE TABLE IF NOT EXISTS notice_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "noticeId" UUID NOT NULL REFERENCES notices(id) ON DELETE CASCADE,
  "readAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE("userId", "noticeId")
);

CREATE INDEX IF NOT EXISTS idx_notice_reads_user ON notice_reads("userId");
CREATE INDEX IF NOT EXISTS idx_notice_reads_notice ON notice_reads("noticeId");

ALTER TABLE notice_reads ENABLE ROW LEVEL SECURITY;
