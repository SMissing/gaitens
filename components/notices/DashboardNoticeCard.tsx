import Link from 'next/link'
import Image from 'next/image'
import type { Notice } from '@/types/database'
import { formatDate, formatRelativeShort } from '@/lib/date-utils'
import { cn } from '@/lib/utils'

interface DashboardNoticeCardProps {
  notice: Notice
}

/**
 * Single full-width notice teaser on the dashboard (not nested inside a parent “board” card).
 */
export function DashboardNoticeCard({ notice }: DashboardNoticeCardProps) {
  const imageUrl = notice.attachments?.[0] ?? null

  return (
    <Link
      href="/notices"
      className={cn(
        'group block overflow-hidden rounded-2xl border border-border/45 bg-card shadow-md transition-all',
        'hover:border-spirits-cyan/35 hover:shadow-lg active:scale-[0.99]'
      )}
    >
      <div className="h-0.5 w-full bg-gradient-to-r from-spirits-cyan/70 via-spirits-magenta/60 to-spirits-yellow/70 opacity-80 group-hover:opacity-100" />

      <div className="flex flex-col sm:flex-row">
        {imageUrl ? (
          <div className="relative h-36 w-full shrink-0 bg-muted sm:h-auto sm:w-40 sm:min-h-[140px]">
            <Image
              src={imageUrl}
              alt={notice.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 160px"
              unoptimized
            />
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            {notice.pinned && (
              <span className="rounded-md bg-spirits-yellow/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-spirits-yellow">
                Pinned
              </span>
            )}
            <span className="text-[11px] tabular-nums text-muted-foreground sm:text-xs">
              {formatRelativeShort(notice.createdAt)}
              <span className="mx-1.5 text-border">·</span>
              {formatDate(notice.createdAt)}
            </span>
          </div>
          <h3 className="text-base font-semibold leading-snug text-foreground sm:text-lg">{notice.title}</h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{notice.content}</p>
          <span className="pt-1 text-xs font-medium text-spirits-cyan/90 group-hover:text-spirits-cyan">
            Open notice board
          </span>
        </div>
      </div>
    </Link>
  )
}
