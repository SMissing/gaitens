'use client'

import { useState, useEffect } from 'react'
import { X, Pin, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDate } from '@/lib/date-utils'
import type { Notice } from '@/types/database'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface NoticeModalProps {
  notices: Notice[]
  onClose: () => void
  onMarkAsRead: (noticeId: string) => Promise<void>
}

export function NoticeModal({ notices, onClose, onMarkAsRead }: NoticeModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [imageModalUrl, setImageModalUrl] = useState<string | null>(null)
  const [markedAsRead, setMarkedAsRead] = useState<Set<string>>(new Set())

  const currentNotice = notices[currentIndex]
  const hasMultiple = notices.length > 1

  useEffect(() => {
    // Mark current notice as read when it's displayed (only once per notice)
    if (currentNotice && !markedAsRead.has(currentNotice.id)) {
      setMarkedAsRead(prev => new Set(prev).add(currentNotice.id))
      onMarkAsRead(currentNotice.id).catch(err => {
        console.error('Failed to mark notice as read:', err)
        // Remove from set if it failed so it can be retried
        setMarkedAsRead(prev => {
          const next = new Set(prev)
          next.delete(currentNotice.id)
          return next
        })
      })
    }
  }, [currentIndex, currentNotice?.id, markedAsRead, onMarkAsRead])

  const handleNext = () => {
    if (currentIndex < notices.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      // Last notice, close modal
      onClose()
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const handleClose = async () => {
    // Mark current notice as read before closing (if not already marked)
    if (currentNotice && !markedAsRead.has(currentNotice.id)) {
      setMarkedAsRead(prev => new Set(prev).add(currentNotice.id))
      await onMarkAsRead(currentNotice.id).catch(err => {
        console.error('Failed to mark notice as read:', err)
      })
    }
    onClose()
  }

  if (!currentNotice) return null

  const hasImage = currentNotice.attachments && currentNotice.attachments.length > 0

  return (
    <>
      {/* Main Modal */}
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        onClick={handleClose}
      >
        <div 
          className="relative w-full max-w-2xl max-h-[90vh] bg-card rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border/50">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {currentNotice.pinned && (
                <Pin className="h-5 w-5 text-spirits-yellow fill-spirits-yellow flex-shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                  {currentNotice.title}
                </h2>
                {hasMultiple && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Notice {currentIndex + 1} of {notices.length}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-accent rounded-xl transition-colors flex-shrink-0 touch-manipulation"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {/* Image */}
            {hasImage && (
              <div className="relative w-full h-48 sm:h-64 lg:h-80 mb-4 rounded-xl overflow-hidden border border-border/30">
                <Image
                  src={currentNotice.attachments![0]}
                  alt={currentNotice.title}
                  fill
                  className="object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setImageModalUrl(currentNotice.attachments![0])}
                  sizes="(max-width: 768px) 100vw, 800px"
                  unoptimized
                />
              </div>
            )}

            {/* Content Text */}
            <div className="prose prose-invert max-w-none">
              <p className="text-base sm:text-lg text-foreground whitespace-pre-wrap leading-relaxed">
                {currentNotice.content}
              </p>
            </div>

            {/* Date Info */}
            <div className="mt-6 pt-4 border-t border-border/50 text-sm text-muted-foreground">
              <div>Posted: {formatDate(currentNotice.createdAt)}</div>
              {currentNotice.expiresAt && (
                <div className="mt-1">Expires: {formatDate(currentNotice.expiresAt)}</div>
              )}
            </div>
          </div>

          {/* Footer with Navigation */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-t border-border/50">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <Button
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              {currentIndex < notices.length - 1 ? (
                <>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </>
              ) : (
                'Close'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {imageModalUrl && (
        <div 
          className="fixed inset-0 z-[101] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
          onClick={() => setImageModalUrl(null)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              setImageModalUrl(null)
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
              src={imageModalUrl}
              alt="Notice attachment"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  )
}
