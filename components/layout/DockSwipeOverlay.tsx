'use client'

import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useDockContext } from '@/components/core/dock'
import {
  BookOpen,
  Calendar,
  GraduationCap,
  MessageSquare,
  Lightbulb,
  FileText,
  Award,
  Building2,
  Users,
  Shield,
  CheckCircle,
  X,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react'
import type { User } from '@/types/database'

interface DockSwipeOverlayProps {
  user: User
}

export function DockSwipeOverlay({ user }: DockSwipeOverlayProps) {
  const { activeItem, setActiveItem } = useDockContext()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const renderCategoryContent = () => {
    switch (activeItem) {
      case 'timeoff':
        return (
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-foreground mb-2">Calendar</h2>
            <Link
              href="/holidays"
              onClick={() => setActiveItem(null)}
              className="flex items-center gap-4 p-4 border border-border rounded-xl active:bg-accent active:border-spirits-magenta/50 sm:hover:bg-accent sm:hover:border-spirits-magenta/50 transition-all touch-manipulation min-h-[60px]"
            >
              <Calendar className="h-6 w-6 text-spirits-magenta flex-shrink-0" />
              <div className="text-lg font-medium text-card-foreground">Holidays</div>
            </Link>
            <Link
              href="/upcoming-events"
              onClick={() => setActiveItem(null)}
              className="flex items-center gap-4 p-4 border border-border rounded-xl active:bg-accent active:border-spirits-magenta/50 sm:hover:bg-accent sm:hover:border-spirits-magenta/50 transition-all touch-manipulation min-h-[60px]"
            >
              <Calendar className="h-6 w-6 text-spirits-magenta flex-shrink-0" />
              <div className="text-lg font-medium text-card-foreground">Upcoming Events</div>
            </Link>
          </div>
        )
      case 'learning':
        return (
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-foreground mb-2">Learning</h2>
            <Link
              href="/training"
              onClick={() => setActiveItem(null)}
              className="flex items-center gap-4 p-4 border border-border rounded-xl active:bg-accent active:border-spirits-yellow/50 sm:hover:bg-accent sm:hover:border-spirits-yellow/50 transition-all touch-manipulation min-h-[60px]"
            >
              <GraduationCap className="h-6 w-6 text-spirits-yellow flex-shrink-0" />
              <div className="text-lg font-medium text-card-foreground">Training</div>
            </Link>
            <Link
              href="/handbook"
              onClick={() => setActiveItem(null)}
              className="flex items-center gap-4 p-4 border border-border rounded-xl active:bg-accent active:border-spirits-yellow/50 sm:hover:bg-accent sm:hover:border-spirits-yellow/50 transition-all touch-manipulation min-h-[60px]"
            >
              <BookOpen className="h-6 w-6 text-spirits-yellow flex-shrink-0" />
              <div className="text-lg font-medium text-card-foreground">Handbook</div>
            </Link>
            <Link
              href="/businesses"
              onClick={() => setActiveItem(null)}
              className="flex items-center gap-4 p-4 border border-border rounded-xl active:bg-accent active:border-spirits-yellow/50 sm:hover:bg-accent sm:hover:border-spirits-yellow/50 transition-all touch-manipulation min-h-[60px]"
            >
              <Building2 className="h-6 w-6 text-spirits-yellow flex-shrink-0" />
              <div className="text-lg font-medium text-card-foreground">Businesses</div>
            </Link>
          </div>
        )
      case 'community':
        return (
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-foreground mb-2">Community</h2>
            <Link
              href="/social"
              onClick={() => setActiveItem(null)}
              className="flex items-center gap-4 p-4 border border-border rounded-xl active:bg-accent active:border-spirits-cyan/50 sm:hover:bg-accent sm:hover:border-spirits-cyan/50 transition-all touch-manipulation min-h-[60px]"
            >
              <MessageSquare className="h-6 w-6 text-spirits-cyan flex-shrink-0" />
              <div className="text-lg font-medium text-card-foreground">Social</div>
            </Link>
            <Link
              href="/employee-of-the-month"
              onClick={() => setActiveItem(null)}
              className="flex items-center gap-4 p-4 border border-border rounded-xl active:bg-accent active:border-spirits-yellow/50 sm:hover:bg-accent sm:hover:border-spirits-yellow/50 transition-all touch-manipulation min-h-[60px]"
            >
              <Award className="h-6 w-6 text-spirits-yellow flex-shrink-0" />
              <div className="text-lg font-medium text-card-foreground">Employee of the Month</div>
            </Link>
            <Link
              href="/photo-album"
              onClick={() => setActiveItem(null)}
              className="flex items-center gap-4 p-4 border border-border rounded-xl active:bg-accent active:border-spirits-cyan/50 sm:hover:bg-accent sm:hover:border-spirits-cyan/50 transition-all touch-manipulation min-h-[60px]"
            >
              <ImageIcon className="h-6 w-6 text-spirits-cyan flex-shrink-0" />
              <div className="text-lg font-medium text-card-foreground">Photo Album</div>
            </Link>
          </div>
        )
      case 'feedback':
        return (
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-foreground mb-2">Feedback</h2>
            <Link
              href="/ideas"
              onClick={() => setActiveItem(null)}
              className="flex items-center gap-4 p-4 border border-border rounded-xl active:bg-accent active:border-spirits-yellow/50 sm:hover:bg-accent sm:hover:border-spirits-yellow/50 transition-all touch-manipulation min-h-[60px]"
            >
              <Lightbulb className="h-6 w-6 text-spirits-yellow flex-shrink-0" />
              <div className="text-lg font-medium text-card-foreground">Ideas</div>
            </Link>
            <Link
              href="/grievance"
              onClick={() => setActiveItem(null)}
              className="flex items-center gap-4 p-4 border border-border rounded-xl active:bg-accent active:border-garrison-orange/50 sm:hover:bg-accent sm:hover:border-garrison-orange/50 transition-all touch-manipulation min-h-[60px]"
            >
              <FileText className="h-6 w-6 text-garrison-orange flex-shrink-0" />
              <div className="text-lg font-medium text-card-foreground">Grievance</div>
            </Link>
            <Link
              href="/anonymous-report"
              onClick={() => setActiveItem(null)}
              className="flex items-center gap-4 p-4 border border-border rounded-xl active:bg-accent active:border-garrison-orange/50 sm:hover:bg-accent sm:hover:border-garrison-orange/50 transition-all touch-manipulation min-h-[60px]"
            >
              <FileText className="h-6 w-6 text-garrison-orange flex-shrink-0" />
              <div className="text-lg font-medium text-card-foreground">Anonymous Report</div>
            </Link>
          </div>
        )
      case 'manager':
        return (
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-foreground mb-2">Manager</h2>
            <Link
              href="/manager/staff"
              onClick={() => setActiveItem(null)}
              className="flex items-center gap-4 p-4 border border-border rounded-xl active:bg-accent active:border-spirits-magenta/50 sm:hover:bg-accent sm:hover:border-spirits-magenta/50 transition-all touch-manipulation min-h-[60px]"
            >
              <Users className="h-6 w-6 text-spirits-magenta flex-shrink-0" />
              <div className="text-lg font-medium text-card-foreground">Manage Staff</div>
            </Link>
            <Link
              href="/manager/training"
              onClick={() => setActiveItem(null)}
              className="flex items-center gap-4 p-4 border border-border rounded-xl active:bg-accent active:border-spirits-magenta/50 sm:hover:bg-accent sm:hover:border-spirits-magenta/50 transition-all touch-manipulation min-h-[60px]"
            >
              <GraduationCap className="h-6 w-6 text-spirits-magenta flex-shrink-0" />
              <div className="text-lg font-medium text-card-foreground">Module Maker</div>
            </Link>
            <Link
              href="/manager/notices/post"
              onClick={() => setActiveItem(null)}
              className="flex items-center gap-4 p-4 border border-border rounded-xl active:bg-accent active:border-spirits-magenta/50 sm:hover:bg-accent sm:hover:border-spirits-magenta/50 transition-all touch-manipulation min-h-[60px]"
            >
              <FileText className="h-6 w-6 text-spirits-magenta flex-shrink-0" />
              <div className="text-lg font-medium text-card-foreground">Post Notice</div>
            </Link>
            <Link
              href="/manager/meetings"
              onClick={() => setActiveItem(null)}
              className="flex items-center gap-4 p-4 border border-border rounded-xl active:bg-accent active:border-spirits-magenta/50 sm:hover:bg-accent sm:hover:border-spirits-magenta/50 transition-all touch-manipulation min-h-[60px]"
            >
              <Calendar className="h-6 w-6 text-spirits-magenta flex-shrink-0" />
              <div className="text-lg font-medium text-card-foreground">Meetings</div>
            </Link>
          </div>
        )
      case 'admin':
        return (
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-foreground mb-2">Admin</h2>
            <Link
              href="/admin/holidays/approve"
              onClick={() => setActiveItem(null)}
              className="flex items-center gap-4 p-4 border border-border rounded-xl active:bg-accent active:border-garrison-orange/50 sm:hover:bg-accent sm:hover:border-garrison-orange/50 transition-all touch-manipulation min-h-[60px]"
            >
              <CheckCircle className="h-6 w-6 text-garrison-orange flex-shrink-0" />
              <div className="text-lg font-medium text-card-foreground">Approve Holidays</div>
            </Link>
            <Link
              href="/admin/disciplinaries"
              onClick={() => setActiveItem(null)}
              className="flex items-center gap-4 p-4 border border-border rounded-xl active:bg-accent active:border-red-500/50 sm:hover:bg-accent sm:hover:border-red-500/50 transition-all touch-manipulation min-h-[60px]"
            >
              <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
              <div className="text-lg font-medium text-card-foreground">Disciplinaries</div>
            </Link>
            <Link
              href="/admin/achievements"
              onClick={() => setActiveItem(null)}
              className="flex items-center gap-4 p-4 border border-border rounded-xl active:bg-accent active:border-spirits-cyan/50 sm:hover:bg-accent sm:hover:border-spirits-cyan/50 transition-all touch-manipulation min-h-[60px]"
            >
              <Award className="h-6 w-6 text-spirits-cyan flex-shrink-0" />
              <div className="text-lg font-medium text-card-foreground">Create Badges</div>
            </Link>
          </div>
        )
      default:
        return null
    }
  }

  if (!activeItem || !mounted) return null

  const overlayContent = (
    <div 
      data-dock-overlay
      className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-xl transition-transform duration-300 ease-out transform translate-y-0"
    >
      <div 
        className="absolute right-4"
        style={{
          top: 'calc(env(safe-area-inset-top, 0px) + 60px)',
        }}
      >
        <button
          onClick={() => setActiveItem(null)}
          className="p-2 active:opacity-70 transition-opacity touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <X className="h-6 w-6 text-foreground" />
        </button>
      </div>
      <div className="h-full flex items-center justify-center px-4 py-20 pb-32">
        <div className="w-full max-w-md">
          {renderCategoryContent()}
        </div>
      </div>
    </div>
  )

  return createPortal(overlayContent, document.body)
}
