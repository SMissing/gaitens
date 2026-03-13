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

  // Determine if notice is long
  const isLongNotice = (notice: Notice) => {
    const hasImage = notice.attachments && notice.attachments.length > 0
    const isLongContent = notice.content && notice.content.length > 200
    return hasImage || isLongContent
  }

  return (
    <>
      <div className="flex flex-col gap-6 px-4 sm:px-6 lg:px-8">
        {notices.map(({ notice, color, rotation }) => {
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
        })}
      </div>

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
