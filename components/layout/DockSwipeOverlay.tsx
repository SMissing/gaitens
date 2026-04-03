'use client'

import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import { useDockContext } from '@/components/core/dock'
import {
  BookOpen,
  Calendar,
  History,
  GraduationCap,
  MessageSquare,
  Lightbulb,
  FileText,
  Award,
  Building2,
  Users,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  Ban,
  Newspaper,
  Scale,
  ClipboardCheck,
  TabletSmartphone,
  Megaphone,
  Gamepad2,
  Layers,
} from 'lucide-react'
import type { User } from '@/types/database'

interface DockSwipeOverlayProps {
  user: User
}

const panelTransition = {
  type: 'spring' as const,
  bounce: 0.1,
  duration: 0.25,
}

function categoryTitle(activeItem: string | null): string {
  switch (activeItem) {
    case 'timeoff':
      return 'Calendar'
    case 'learning':
      return 'Learning'
    case 'community':
      return 'Community'
    case 'feedback':
      return 'Feedback'
    case 'manager':
      return 'Manager'
    case 'admin':
      return 'Admin'
    case 'games':
      return 'Games'
    default:
      return ''
  }
}

const linkClass =
  'flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors touch-manipulation sm:hover:bg-accent active:scale-[0.99]'

export function DockSwipeOverlay({ user }: DockSwipeOverlayProps) {
  const { activeItem, setActiveItem } = useDockContext()

  const renderCategoryContent = () => {
    switch (activeItem) {
      case 'timeoff':
        return (
          <div className="grid gap-1">
            <Link
              href="/holidays"
              onClick={() => setActiveItem(null)}
              className={linkClass}
            >
              <Calendar className="h-5 w-5 text-spirits-magenta flex-shrink-0" />
              <span className="font-medium text-foreground">Holidays</span>
            </Link>
            <Link
              href="/upcoming-events"
              onClick={() => setActiveItem(null)}
              className={linkClass}
            >
              <Calendar className="h-5 w-5 text-spirits-magenta flex-shrink-0" />
              <span className="font-medium text-foreground">Upcoming Events</span>
            </Link>
            <Link
              href="/past-events"
              onClick={() => setActiveItem(null)}
              className={linkClass}
            >
              <History className="h-5 w-5 text-spirits-magenta flex-shrink-0" />
              <span className="font-medium text-foreground">Past Events</span>
            </Link>
          </div>
        )
      case 'learning':
        return (
          <div className="grid gap-1">
            <Link
              href="/training"
              onClick={() => setActiveItem(null)}
              className={linkClass}
            >
              <GraduationCap className="h-5 w-5 text-spirits-yellow flex-shrink-0" />
              <span className="font-medium text-foreground">Training</span>
            </Link>
            <Link
              href="/handbook"
              onClick={() => setActiveItem(null)}
              className={linkClass}
            >
              <BookOpen className="h-5 w-5 text-spirits-yellow flex-shrink-0" />
              <span className="font-medium text-foreground">Handbook</span>
            </Link>
            <Link
              href="/businesses"
              onClick={() => setActiveItem(null)}
              className={linkClass}
            >
              <Building2 className="h-5 w-5 text-spirits-yellow flex-shrink-0" />
              <span className="font-medium text-foreground">Businesses</span>
            </Link>
          </div>
        )
      case 'community':
        return (
          <div className="grid gap-1">
            <Link
              href="/social"
              onClick={() => setActiveItem(null)}
              className={linkClass}
            >
              <MessageSquare className="h-5 w-5 text-spirits-cyan flex-shrink-0" />
              <span className="font-medium text-foreground">Social</span>
            </Link>
            <Link
              href="/notices"
              onClick={() => setActiveItem(null)}
              className={linkClass}
            >
              <Megaphone className="h-5 w-5 text-spirits-yellow flex-shrink-0" />
              <span className="font-medium text-foreground">Notice board</span>
            </Link>
            <Link
              href="/employee-of-the-month"
              onClick={() => setActiveItem(null)}
              className={linkClass}
            >
              <Award className="h-5 w-5 text-spirits-yellow flex-shrink-0" />
              <span className="font-medium text-foreground">Employee of the Month</span>
            </Link>
            <Link
              href="/photo-album"
              onClick={() => setActiveItem(null)}
              className={linkClass}
            >
              <ImageIcon className="h-5 w-5 text-spirits-cyan flex-shrink-0" />
              <span className="font-medium text-foreground">Photo Album</span>
            </Link>
            <Link
              href="/blog"
              onClick={() => setActiveItem(null)}
              className={linkClass}
            >
              <Newspaper className="h-5 w-5 text-spirits-cyan flex-shrink-0" />
              <span className="font-medium text-foreground">Blog</span>
            </Link>
          </div>
        )
      case 'feedback':
        return (
          <div className="grid gap-1">
            <Link
              href="/ideas"
              onClick={() => setActiveItem(null)}
              className={linkClass}
            >
              <Lightbulb className="h-5 w-5 text-spirits-yellow flex-shrink-0" />
              <span className="font-medium text-foreground">Ideas</span>
            </Link>
            <Link
              href="/app-feedback"
              onClick={() => setActiveItem(null)}
              className={linkClass}
            >
              <TabletSmartphone className="h-5 w-5 text-spirits-cyan flex-shrink-0" />
              <span className="font-medium text-foreground">App feedback</span>
            </Link>
            <Link
              href="/grievance"
              onClick={() => setActiveItem(null)}
              className={linkClass}
            >
              <FileText className="h-5 w-5 text-garrison-orange flex-shrink-0" />
              <span className="font-medium text-foreground">Grievance</span>
            </Link>
            <Link
              href="/anonymous-report"
              onClick={() => setActiveItem(null)}
              className={linkClass}
            >
              <FileText className="h-5 w-5 text-garrison-orange flex-shrink-0" />
              <span className="font-medium text-foreground">Anonymous Report</span>
            </Link>
          </div>
        )
      case 'games':
        return (
          <div className="grid gap-1">
            <Link
              href="/games/brick-breaker"
              onClick={() => setActiveItem(null)}
              className={linkClass}
            >
              <Gamepad2 className="h-5 w-5 text-spirits-cyan flex-shrink-0" />
              <span className="font-medium text-foreground">Brick Breaker</span>
            </Link>
            <Link
              href="/games/stacker"
              onClick={() => setActiveItem(null)}
              className={linkClass}
            >
              <Layers className="h-5 w-5 text-spirits-cyan flex-shrink-0" />
              <span className="font-medium text-foreground">Stacker</span>
            </Link>
          </div>
        )
      case 'manager':
        return (
          <div className="grid gap-1 max-h-[min(280px,45vh)] overflow-y-auto overscroll-contain pr-0.5 -mr-0.5">
            <Link
              href="/manager/staff"
              onClick={() => setActiveItem(null)}
              className={linkClass}
            >
              <Users className="h-5 w-5 text-spirits-magenta flex-shrink-0" />
              <span className="font-medium text-foreground">Manage Staff</span>
            </Link>
            <Link
              href="/manager/barred"
              onClick={() => setActiveItem(null)}
              className={linkClass}
            >
              <Ban className="h-5 w-5 text-spirits-magenta flex-shrink-0" />
              <span className="font-medium text-foreground">Barred List</span>
            </Link>
            <Link
              href="/manager/training"
              onClick={() => setActiveItem(null)}
              className={linkClass}
            >
              <GraduationCap className="h-5 w-5 text-spirits-magenta flex-shrink-0" />
              <span className="font-medium text-foreground">Module Maker</span>
            </Link>
            <Link
              href="/manager/notices/post"
              onClick={() => setActiveItem(null)}
              className={linkClass}
            >
              <FileText className="h-5 w-5 text-spirits-magenta flex-shrink-0" />
              <span className="font-medium text-foreground">Post Notice</span>
            </Link>
            <Link
              href="/manager/meetings"
              onClick={() => setActiveItem(null)}
              className={linkClass}
            >
              <Calendar className="h-5 w-5 text-spirits-magenta flex-shrink-0" />
              <span className="font-medium text-foreground">Meetings</span>
            </Link>
            <Link
              href="/manager/management-calendar"
              onClick={() => setActiveItem(null)}
              className={linkClass}
            >
              <Calendar className="h-5 w-5 text-spirits-magenta flex-shrink-0" />
              <span className="font-medium text-foreground">Management Calendar</span>
            </Link>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground px-1 pt-2 pb-0.5">
              Badges
            </p>
            <Link
              href="/manager/achievements"
              onClick={() => setActiveItem(null)}
              className={linkClass}
            >
              <Award className="h-5 w-5 text-spirits-cyan flex-shrink-0" />
              <span className="font-medium text-foreground">Staff Badges</span>
            </Link>
            <Link
              href="/manager/achievements/create"
              onClick={() => setActiveItem(null)}
              className={linkClass}
            >
              <Award className="h-5 w-5 text-spirits-cyan flex-shrink-0" />
              <span className="font-medium text-foreground">Create Badges</span>
            </Link>
            <Link
              href="/manager/badge-requests"
              onClick={() => setActiveItem(null)}
              className={linkClass}
            >
              <ClipboardCheck className="h-5 w-5 text-spirits-cyan flex-shrink-0" />
              <span className="font-medium text-foreground">Approve badge requests</span>
            </Link>
          </div>
        )
      case 'admin':
        if (user.role !== 'admin') return null
        return (
          <div className="grid gap-1 max-h-[min(280px,45vh)] overflow-y-auto overscroll-contain pr-0.5 -mr-0.5">
            <Link
              href="/admin/holidays/approve"
              onClick={() => setActiveItem(null)}
              className={linkClass}
            >
              <CheckCircle className="h-5 w-5 text-garrison-orange flex-shrink-0" />
              <span className="font-medium text-foreground">Approve Holidays</span>
            </Link>
            <Link
              href="/admin/disciplinaries"
              onClick={() => setActiveItem(null)}
              className={linkClass}
            >
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <span className="font-medium text-foreground">Disciplinaries</span>
            </Link>
            <Link
              href="/admin/blog"
              onClick={() => setActiveItem(null)}
              className={linkClass}
            >
              <Newspaper className="h-5 w-5 text-spirits-cyan flex-shrink-0" />
              <span className="font-medium text-foreground">Blog</span>
            </Link>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground px-1 pt-2 pb-0.5">
              Legal
            </p>
            <Link
              href="/admin/bardisc"
              onClick={() => setActiveItem(null)}
              className={linkClass}
            >
              <Scale className="h-5 w-5 text-garrison-orange flex-shrink-0" />
              <span className="font-medium text-foreground">Barred Disclaimers</span>
            </Link>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <AnimatePresence initial={false}>
      {activeItem && (
        <motion.div
          key={activeItem}
          data-dock-category-panel
          transition={panelTransition}
          initial={{ opacity: 0, y: 10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: 10, height: 0 }}
          className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden z-[1] pointer-events-auto"
        >
          <div className="rounded-2xl border border-white/10 bg-[#171717] shadow-2xl p-2">
            <p className="px-1 pb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground truncate">
              {categoryTitle(activeItem)}
            </p>
            {renderCategoryContent()}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
