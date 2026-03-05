'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText } from 'lucide-react'
import { formatDate } from '@/lib/date-utils'
import type { Notice } from '@/types/database'

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
    <div className="relative bg-gradient-to-br from-card/90 via-card/80 to-card/90 backdrop-blur-md rounded-xl shadow-2xl border-2 border-spirits-cyan/30 overflow-hidden">
      {/* Animated border glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-spirits-cyan/20 via-spirits-magenta/20 to-spirits-yellow/20 opacity-50 animate-pulse"></div>
      
      {/* Content */}
      <div className="relative z-10 p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-spirits-cyan/20 rounded-lg border border-spirits-cyan/50">
              <FileText className="h-6 w-6 text-spirits-cyan" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Notice Board</h2>
              <p className="text-sm text-muted-foreground">Important updates and announcements</p>
            </div>
          </div>
          <Link
            href="/notices"
            className="text-spirits-cyan hover:text-spirits-cyan-dark text-sm font-semibold transition-all hover:underline flex items-center gap-1"
          >
            View All →
          </Link>
        </div>

        {notices && notices.length > 0 && (
          <div className="space-y-4">
            {notices.map((notice: any) => (
              <div
                key={notice.id}
                className="p-4 rounded-lg border transition-all bg-spirits-yellow/10 border-spirits-yellow/50 border-l-4 border-l-spirits-yellow"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <span className="text-2xl">📌</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-spirits-yellow">
                        {notice.title}
                      </h3>
                      <span className="px-2 py-1 bg-spirits-yellow/20 text-spirits-yellow text-xs font-medium rounded border border-spirits-yellow/30 whitespace-nowrap">
                        PINNED
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {notice.content}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground/70">
                      <span>{formatDate(notice.createdAt)}</span>
                      {notice.expiresAt && (
                        <span>
                          Expires: {formatDate(notice.expiresAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && nonPinnedCount !== null && nonPinnedCount > 0 && (
          <div className={`mt-6 pt-4 border-t border-border/50 text-center ${notices && notices.length > 0 ? '' : 'mt-0 pt-0 border-t-0'}`}>
            <p className="text-sm text-muted-foreground">
              There {nonPinnedCount === 1 ? 'is' : 'are'} <span className="font-semibold text-spirits-cyan">{nonPinnedCount}</span> {nonPinnedCount === 1 ? 'notice' : 'notices'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
