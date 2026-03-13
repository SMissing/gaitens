'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, ArrowRight, Pin } from 'lucide-react'
import { formatDate } from '@/lib/date-utils'
import type { Notice } from '@/types/database'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface NoticeBoardCardProps {
  notices: Notice[]
}

export function NoticeBoardCard({ notices }: NoticeBoardCardProps) {
  const [nonPinnedCount, setNonPinnedCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch count of non-pinned notices
    const fetchNoticeCount = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/notices/non-pinned-count')
        if (response.ok) {
          const data = await response.json()
          setNonPinnedCount(data.count ?? 0)
        } else {
          setNonPinnedCount(0)
        }
      } catch (error) {
        console.error('Error fetching notice count:', error)
        setNonPinnedCount(0)
      } finally {
        setLoading(false)
      }
    }

    fetchNoticeCount()
  }, [])

  return (
    <div className="relative bg-card/60 backdrop-blur-md rounded-2xl border border-border/30 shadow-lg overflow-hidden">
      {/* Content */}
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-spirits-cyan/20 rounded-xl">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-spirits-cyan" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Notice Board</h2>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Important updates and announcements</p>
            </div>
          </div>
          <Link
            href="/notices"
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-spirits-cyan/10 hover:bg-spirits-cyan/20 text-spirits-cyan rounded-xl text-xs sm:text-sm font-semibold transition-all touch-manipulation active:scale-95"
          >
            View All
            <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Link>
        </div>

        {/* Notices */}
        {notices && notices.length > 0 ? (
          <div className="space-y-3">
            {notices.map((notice: any) => (
              <Link
                key={notice.id}
                href="/notices"
                className="block group"
              >
                <div className="relative p-4 rounded-xl bg-gradient-to-br from-spirits-yellow/10 via-spirits-yellow/5 to-transparent border border-spirits-yellow/30 hover:border-spirits-yellow/50 transition-all cursor-pointer overflow-hidden">
                  {/* Pin indicator */}
                  <div className="absolute top-3 right-3">
                    <Pin className="h-4 w-4 text-spirits-yellow fill-spirits-yellow" />
                  </div>

                  {/* Image if available */}
                  {notice.attachments && notice.attachments.length > 0 && (
                    <div className="relative w-full h-32 sm:h-40 mb-3 rounded-lg overflow-hidden">
                      <Image
                        src={notice.attachments[0]}
                        alt={notice.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 100%"
                        unoptimized
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="pr-6">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1.5 line-clamp-1 group-hover:text-spirits-yellow transition-colors">
                      {notice.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {notice.content}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{formatDate(notice.createdAt)}</span>
                      {notice.expiresAt && (
                        <>
                          <span>•</span>
                          <span>Expires: {formatDate(notice.expiresAt)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No pinned notices</p>
          </div>
        )}

        {/* Non-pinned count footer */}
        {!loading && nonPinnedCount !== null && nonPinnedCount > 0 && (
          <div className={cn(
            "mt-4 sm:mt-6 pt-4 border-t border-border/30",
            notices && notices.length > 0 ? '' : 'mt-0 pt-0 border-t-0'
          )}>
            <Link
              href="/notices"
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-spirits-cyan transition-colors"
            >
              <span>
                {nonPinnedCount === 1 
                  ? `1 more notice` 
                  : `${nonPinnedCount} more notices`}
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
