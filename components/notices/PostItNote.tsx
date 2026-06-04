'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/date-utils'
import type { Notice } from '@/types/database'
import { Pin, Edit } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { NoticeFormattedBody } from '@/components/notices/NoticeFormattedBody'

interface PostItNoteProps {
  notice: Notice
  color: 'yellow' | 'magenta' | 'cyan'
  rotation?: number
  onImageClick?: (imageUrl: string) => void
  isAdmin?: boolean
}

export function PostItNote({ notice, color, rotation = 0, onImageClick, isAdmin = false }: PostItNoteProps) {
  const router = useRouter()
  const colorClasses = {
    yellow: {
      bg: 'bg-[#D4C46A]',
      border: 'border-[#B8A85A]',
      text: 'text-[#6B5D2E]',
      shadow: 'shadow-[0_4px_8px_rgba(212,196,106,0.2)]',
      pin: 'text-[#6B5D2E]',
    },
    magenta: {
      bg: 'bg-[#B87A9A]',
      border: 'border-[#9D6A85]',
      text: 'text-[#5C3F4F]',
      shadow: 'shadow-[0_4px_8px_rgba(184,122,154,0.2)]',
      pin: 'text-[#5C3F4F]',
    },
    cyan: {
      bg: 'bg-[#7AA8B8]',
      border: 'border-[#6A95A3]',
      text: 'text-[#3F5C66]',
      shadow: 'shadow-[0_4px_8px_rgba(122,168,184,0.2)]',
      pin: 'text-[#3F5C66]',
    },
  }

  const styles = colorClasses[color]
  const isExpired = notice.expiresAt && new Date(notice.expiresAt) < new Date()
  
  // Determine if notice is long (has image or content is longer than ~200 chars)
  const hasImage = notice.attachments && notice.attachments.length > 0
  const isLongContent = notice.content && notice.content.length > 200
  const isLongNotice = hasImage || isLongContent

  return (
    <div
      className={cn(
        'relative p-6 rounded-xl border-2 transition-all hover:scale-105 hover:z-10',
        styles.bg,
        notice.pinned ? 'border-amber-400/80 shadow-[0_0_0_1px_rgba(251,191,36,0.3),0_8px_24px_rgba(251,191,36,0.15)]' : styles.border,
        notice.pinned ? '' : styles.shadow,
        'min-h-[200px]',
        isLongNotice 
          ? 'w-full max-w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-4rem)] lg:max-w-[calc(100vw-8rem)]' 
          : 'w-full max-w-[300px]',
        'transform-gpu'
      )}
      style={{
        transform: `rotate(${rotation}deg)`,
      }}
    >
      {/* Pin icon for pinned notices */}
      {notice.pinned && (
        <div className="absolute -top-2 -right-2">
          <Pin className={cn('h-6 w-6 fill-current', styles.pin)} />
        </div>
      )}

      {/* Edit button for admins */}
      {isAdmin && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/notices/edit/${notice.id}`)
          }}
          className={cn(
            'absolute top-2 p-2 rounded-full transition-all z-20',
            notice.pinned ? 'right-8' : 'right-2',
            'hover:scale-110 active:scale-95',
            'bg-black/20 hover:bg-black/30',
            'backdrop-blur-sm border border-black/20',
            'touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center'
          )}
          aria-label="Edit notice"
        >
          <Edit className={cn('h-4 w-4', styles.text)} />
        </button>
      )}

      {/* Expired badge */}
      {isExpired && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-black/20 rounded text-xs font-semibold">
          EXPIRED
        </div>
      )}

      {/* Content */}
      <div className="space-y-3">
        <h3 className={cn('font-bold text-lg leading-tight', styles.text)}>
          {notice.title}
        </h3>
        <NoticeFormattedBody
          content={notice.content}
          className={cn('text-sm', styles.text, 'opacity-90')}
        />
        {notice.attachments && notice.attachments.length > 0 && (
          <div 
            className={cn(
              'relative w-full rounded overflow-hidden border-2 cursor-pointer hover:opacity-80 transition-opacity', 
              styles.border,
              isLongNotice ? 'h-48 sm:h-64 lg:h-80' : 'h-32'
            )}
            onClick={() => onImageClick?.(notice.attachments![0])}
          >
            <img
              src={notice.attachments[0]}
              alt="Notice attachment"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className={cn('text-xs mt-4 pt-3 border-t-2', styles.border, styles.text, 'opacity-70')}>
          <div>{formatDate(notice.createdAt)}</div>
          {notice.expiresAt && (
            <div className="mt-1">
              Expires: {formatDate(notice.expiresAt)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
