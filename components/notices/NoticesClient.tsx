'use client'

import { PostItNote } from './PostItNote'
import { FileText } from 'lucide-react'
import type { Notice } from '@/types/database'

interface NoticeWithStyle {
  notice: Notice
  color: 'yellow' | 'magenta' | 'cyan'
  rotation: number
}

interface NoticesClientProps {
  notices: NoticeWithStyle[]
}

export function NoticesClient({ notices }: NoticesClientProps) {
  if (notices.length === 0) {
    return (
      <div className="text-center py-16">
        <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-xl text-muted-foreground">No notices at this time.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
      {notices.map(({ notice, color, rotation }) => (
        <PostItNote
          key={notice.id}
          notice={notice}
          color={color}
          rotation={rotation}
        />
      ))}
    </div>
  )
}
