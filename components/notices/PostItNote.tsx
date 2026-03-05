import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/date-utils'
import type { Notice } from '@/types/database'
import { Pin } from 'lucide-react'

interface PostItNoteProps {
  notice: Notice
  color: 'yellow' | 'magenta' | 'cyan'
  rotation?: number
}

export function PostItNote({ notice, color, rotation = 0 }: PostItNoteProps) {
  const colorClasses = {
    yellow: {
      bg: 'bg-[#FFEB3B]',
      border: 'border-[#FDD835]',
      text: 'text-[#F57F17]',
      shadow: 'shadow-[0_4px_8px_rgba(255,235,59,0.3)]',
      pin: 'text-[#F57F17]',
    },
    magenta: {
      bg: 'bg-[#E91E63]',
      border: 'border-[#C2185B]',
      text: 'text-[#880E4F]',
      shadow: 'shadow-[0_4px_8px_rgba(233,30,99,0.3)]',
      pin: 'text-[#880E4F]',
    },
    cyan: {
      bg: 'bg-[#00BCD4]',
      border: 'border-[#0097A7]',
      text: 'text-[#006064]',
      shadow: 'shadow-[0_4px_8px_rgba(0,188,212,0.3)]',
      pin: 'text-[#006064]',
    },
  }

  const styles = colorClasses[color]
  const isExpired = notice.expiresAt && new Date(notice.expiresAt) < new Date()

  return (
    <div
      className={cn(
        'relative p-6 rounded-sm border-2 transition-all hover:scale-105 hover:z-10',
        styles.bg,
        styles.border,
        styles.shadow,
        'min-h-[200px] max-w-[300px] w-full',
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
        <p className={cn('text-sm leading-relaxed line-clamp-6', styles.text, 'opacity-90')}>
          {notice.content}
        </p>
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
