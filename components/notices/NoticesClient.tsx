'use client'

import { useState } from 'react'
import { PostItNote } from './PostItNote'
import { FileText, X } from 'lucide-react'
import type { Notice } from '@/types/database'
import { cn } from '@/lib/utils'

interface NoticeWithStyle {
  notice: Notice
  color: 'yellow' | 'magenta' | 'cyan'
  rotation: number
}

interface NoticesClientProps {
  notices: NoticeWithStyle[]
  userRole?: string
}

const COLOR_LEGEND = [
  { color: 'cyan',    bg: 'bg-[#7AA8B8]',    label: 'Informational' },
  { color: 'yellow',  bg: 'bg-[#D4C46A]',    label: 'Action Required' },
  { color: 'magenta', bg: 'bg-[#B87A9A]',    label: 'Time-Sensitive' },
] as const

export function NoticesClient({ notices, userRole }: NoticesClientProps) {
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null)

  if (notices.length === 0) {
    return (
      <div className="text-center py-16">
        <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-xl text-muted-foreground">No notices at this time.</p>
      </div>
    )
  }

  const isLongNotice = (notice: Notice) => {
    const hasImage = notice.attachments && notice.attachments.length > 0
    const isLongContent = notice.content && notice.content.length > 200
    return hasImage || isLongContent
  }

  const pinned = notices.filter(({ notice }) => notice.pinned)
  const regular = notices.filter(({ notice }) => !notice.pinned)

  const renderNotice = ({ notice, color, rotation }: NoticeWithStyle) => {
    const isLong = isLongNotice(notice)
    return (
      <div
        key={notice.id}
        className={cn(
          'flex justify-center',
          isLong ? 'w-full' : 'w-full sm:w-auto sm:max-w-[300px]'
        )}
      >
        <PostItNote
          notice={notice}
          color={color}
          rotation={isLong ? 0 : rotation}
          onImageClick={setModalImageUrl}
          isAdmin={userRole === 'admin'}
        />
      </div>
    )
  }

  return (
    <>
      {/* Colour legend */}
      <div className="flex flex-wrap gap-3 px-4 sm:px-6 lg:px-8 mb-6">
        {COLOR_LEGEND.map(({ color, bg, label }) => (
          <div key={color} className="flex items-center gap-1.5">
            <span className={`h-3 w-3 rounded-full ${bg} flex-shrink-0`} />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Pinned notices */}
      {pinned.length > 0 && (
        <div className="mb-6">
          <p className="px-4 sm:px-6 lg:px-8 text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Pinned
          </p>
          <div className="flex flex-col gap-6 px-4 sm:px-6 lg:px-8">
            {pinned.map(renderNotice)}
          </div>
        </div>
      )}

      {/* Regular notices */}
      {regular.length > 0 && (
        <div>
          {pinned.length > 0 && (
            <p className="px-4 sm:px-6 lg:px-8 text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              All Notices
            </p>
          )}
          <div className="flex flex-col gap-6 px-4 sm:px-6 lg:px-8">
            {regular.map(renderNotice)}
          </div>
        </div>
      )}

      {/* Image Modal - Rendered outside of post-it notes */}
      {modalImageUrl && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setModalImageUrl(null)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              setModalImageUrl(null)
            }}
            className="absolute top-4 right-4 z-10 p-2 bg-card/90 hover:bg-card rounded-full border border-border transition-colors"
            aria-label="Close image"
          >
            <X className="h-6 w-6 text-foreground" />
          </button>
          <div 
            className="relative max-w-[90vw] max-h-[90vh] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={modalImageUrl}
              alt="Notice attachment"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  )
}
