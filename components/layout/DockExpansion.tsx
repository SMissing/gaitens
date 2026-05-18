'use client'

import Link from 'next/link'
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
  Shield,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  Newspaper,
  Scale,
  ClipboardCheck,
  ListChecks,
  TabletSmartphone,
  Megaphone,
  Gamepad2,
  Layers,
  Flame,
} from 'lucide-react'
import { useDockContext } from '@/components/core/dock'

export function DockExpansion() {
  const { activeItem } = useDockContext()
  const renderContent = () => {
    switch (activeItem) {
      case 'resources':
        return (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-card-foreground mb-1 px-1">Resources</h3>
            <Link
              href="/handbook"
              className="flex items-center gap-3 p-4 sm:p-3 border border-border rounded-full active:bg-accent active:border-spirits-cyan/50 sm:hover:bg-accent sm:hover:border-spirits-cyan/50 transition-all touch-manipulation min-h-[44px]"
            >
              <BookOpen className="h-5 w-5 text-spirits-cyan flex-shrink-0" />
              <div className="text-sm font-medium text-card-foreground">Handbook</div>
            </Link>
            <Link
              href="/businesses"
              className="flex items-center gap-3 p-4 sm:p-3 border border-border rounded-full active:bg-accent active:border-spirits-cyan/50 sm:hover:bg-accent sm:hover:border-spirits-cyan/50 transition-all touch-manipulation min-h-[44px]"
            >
              <Building2 className="h-5 w-5 text-spirits-cyan flex-shrink-0" />
              <div className="text-sm font-medium text-card-foreground">Businesses</div>
            </Link>
          </div>
        )
      case 'timeoff':
        return (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-card-foreground mb-1 px-1">Calendar</h3>
            <Link
              href="/holidays"
              className="flex items-center gap-3 p-4 sm:p-3 border border-border rounded-full active:bg-accent active:border-spirits-magenta/50 sm:hover:bg-accent sm:hover:border-spirits-magenta/50 transition-all touch-manipulation min-h-[44px]"
            >
              <Calendar className="h-5 w-5 text-spirits-magenta flex-shrink-0" />
              <div className="text-sm font-medium text-card-foreground">Holidays</div>
            </Link>
            <Link
              href="/upcoming-events"
              className="flex items-center gap-3 p-4 sm:p-3 border border-border rounded-full active:bg-accent active:border-spirits-magenta/50 sm:hover:bg-accent sm:hover:border-spirits-magenta/50 transition-all touch-manipulation min-h-[44px]"
            >
              <Calendar className="h-5 w-5 text-spirits-magenta flex-shrink-0" />
              <div className="text-sm font-medium text-card-foreground">Upcoming Events</div>
            </Link>
            <Link
              href="/past-events"
              className="flex items-center gap-3 p-4 sm:p-3 border border-border rounded-full active:bg-accent active:border-spirits-magenta/50 sm:hover:bg-accent sm:hover:border-spirits-magenta/50 transition-all touch-manipulation min-h-[44px]"
            >
              <History className="h-5 w-5 text-spirits-magenta flex-shrink-0" />
              <div className="text-sm font-medium text-card-foreground">Past Events</div>
            </Link>
          </div>
        )
      case 'learning':
        return (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-card-foreground mb-1 px-1">Learning</h3>
            <Link
              href="/training"
              className="flex items-center gap-3 p-4 sm:p-3 border border-border rounded-full active:bg-accent active:border-spirits-yellow/50 sm:hover:bg-accent sm:hover:border-spirits-yellow/50 transition-all touch-manipulation min-h-[44px]"
            >
              <GraduationCap className="h-5 w-5 text-spirits-yellow flex-shrink-0" />
              <div className="text-sm font-medium text-card-foreground">Training</div>
            </Link>
          </div>
        )
      case 'community':
        return (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-card-foreground mb-1 px-1">Community</h3>
            <Link
              href="/social"
              className="flex items-center gap-3 p-4 sm:p-3 border border-border rounded-full active:bg-accent active:border-spirits-cyan/50 sm:hover:bg-accent sm:hover:border-spirits-cyan/50 transition-all touch-manipulation min-h-[44px]"
            >
              <MessageSquare className="h-5 w-5 text-spirits-cyan flex-shrink-0" />
              <div className="text-sm font-medium text-card-foreground">Social</div>
            </Link>
            <Link
              href="/notices"
              className="flex items-center gap-3 p-4 sm:p-3 border border-border rounded-full active:bg-accent active:border-spirits-yellow/50 sm:hover:bg-accent sm:hover:border-spirits-yellow/50 transition-all touch-manipulation min-h-[44px]"
            >
              <Megaphone className="h-5 w-5 text-spirits-yellow flex-shrink-0" />
              <div className="text-sm font-medium text-card-foreground">Notice board</div>
            </Link>
            <Link
              href="/employee-of-the-month"
              className="flex items-center gap-3 p-4 sm:p-3 border border-border rounded-full active:bg-accent active:border-spirits-yellow/50 sm:hover:bg-accent sm:hover:border-spirits-yellow/50 transition-all touch-manipulation min-h-[44px]"
            >
              <Award className="h-5 w-5 text-spirits-yellow flex-shrink-0" />
              <div className="text-sm font-medium text-card-foreground">Employee of the Month</div>
            </Link>
            <Link
              href="/photo-album"
              className="flex items-center gap-3 p-4 sm:p-3 border border-border rounded-full active:bg-accent active:border-spirits-cyan/50 sm:hover:bg-accent sm:hover:border-spirits-cyan/50 transition-all touch-manipulation min-h-[44px]"
            >
              <ImageIcon className="h-5 w-5 text-spirits-cyan flex-shrink-0" />
              <div className="text-sm font-medium text-card-foreground">Photo Album</div>
            </Link>
            <Link
              href="/blog"
              className="flex items-center gap-3 p-4 sm:p-3 border border-border rounded-full active:bg-accent active:border-spirits-cyan/50 sm:hover:bg-accent sm:hover:border-spirits-cyan/50 transition-all touch-manipulation min-h-[44px]"
            >
              <Newspaper className="h-5 w-5 text-spirits-cyan flex-shrink-0" />
              <div className="text-sm font-medium text-card-foreground">Blog</div>
            </Link>
          </div>
        )
      case 'feedback':
        return (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-card-foreground mb-1 px-1">Feedback</h3>
            <Link
              href="/ideas"
              className="flex items-center gap-3 p-4 sm:p-3 border border-border rounded-full active:bg-accent active:border-spirits-yellow/50 sm:hover:bg-accent sm:hover:border-spirits-yellow/50 transition-all touch-manipulation min-h-[44px]"
            >
              <Lightbulb className="h-5 w-5 text-spirits-yellow flex-shrink-0" />
              <div className="text-sm font-medium text-card-foreground">Ideas</div>
            </Link>
            <Link
              href="/app-feedback"
              className="flex items-center gap-3 p-4 sm:p-3 border border-border rounded-full active:bg-accent active:border-spirits-cyan/50 sm:hover:bg-accent sm:hover:border-spirits-cyan/50 transition-all touch-manipulation min-h-[44px]"
            >
              <TabletSmartphone className="h-5 w-5 text-spirits-cyan flex-shrink-0" />
              <div className="text-sm font-medium text-card-foreground">App feedback</div>
            </Link>
            <Link
              href="/grievance"
              className="flex items-center gap-3 p-4 sm:p-3 border border-border rounded-full active:bg-accent active:border-garrison-orange/50 sm:hover:bg-accent sm:hover:border-garrison-orange/50 transition-all touch-manipulation min-h-[44px]"
            >
              <FileText className="h-5 w-5 text-garrison-orange flex-shrink-0" />
              <div className="text-sm font-medium text-card-foreground">Grievance</div>
            </Link>
            <Link
              href="/anonymous-report"
              className="flex items-center gap-3 p-4 sm:p-3 border border-border rounded-full active:bg-accent active:border-garrison-orange/50 sm:hover:bg-accent sm:hover:border-garrison-orange/50 transition-all touch-manipulation min-h-[44px]"
            >
              <FileText className="h-5 w-5 text-garrison-orange flex-shrink-0" />
              <div className="text-sm font-medium text-card-foreground">Anonymous Report</div>
            </Link>
          </div>
        )
      case 'games':
        return (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-card-foreground mb-1 px-1">Games</h3>
            <Link
              href="/games/brick-breaker"
              className="flex items-center gap-3 p-4 sm:p-3 border border-border rounded-full active:bg-accent active:border-spirits-cyan/50 sm:hover:bg-accent sm:hover:border-spirits-cyan/50 transition-all touch-manipulation min-h-[44px]"
            >
              <Gamepad2 className="h-5 w-5 text-spirits-cyan flex-shrink-0" />
              <div className="text-sm font-medium text-card-foreground">Brick Breaker</div>
            </Link>
            <Link
              href="/games/stacker"
              className="flex items-center gap-3 p-4 sm:p-3 border border-border rounded-full active:bg-accent active:border-spirits-cyan/50 sm:hover:bg-accent sm:hover:border-spirits-cyan/50 transition-all touch-manipulation min-h-[44px]"
            >
              <Layers className="h-5 w-5 text-spirits-cyan flex-shrink-0" />
              <div className="text-sm font-medium text-card-foreground">Stacker</div>
            </Link>
            <Link
              href="/games/firemon"
              className="flex items-center gap-3 p-4 sm:p-3 border border-border rounded-full active:bg-accent active:border-orange-500/50 sm:hover:bg-accent sm:hover:border-orange-500/50 transition-all touch-manipulation min-h-[44px]"
            >
              <Flame className="h-5 w-5 text-orange-500 flex-shrink-0" />
              <div className="text-sm font-medium text-card-foreground">Firemon (WIP)</div>
            </Link>
          </div>
        )
      case 'manager':
        return (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-card-foreground mb-1 px-1">Manager</h3>
            <Link
              href="/manager/staff"
              className="flex items-center gap-3 p-4 sm:p-3 border border-border rounded-full active:bg-accent active:border-spirits-magenta/50 sm:hover:bg-accent sm:hover:border-spirits-magenta/50 transition-all touch-manipulation min-h-[44px]"
            >
              <Users className="h-5 w-5 text-spirits-magenta flex-shrink-0" />
              <div className="text-sm font-medium text-card-foreground">Manage Staff</div>
            </Link>
            <Link
              href="/manager/training"
              className="flex items-center gap-3 p-4 sm:p-3 border border-border rounded-full active:bg-accent active:border-spirits-magenta/50 sm:hover:bg-accent sm:hover:border-spirits-magenta/50 transition-all touch-manipulation min-h-[44px]"
            >
              <GraduationCap className="h-5 w-5 text-spirits-magenta flex-shrink-0" />
              <div className="text-sm font-medium text-card-foreground">Module Maker</div>
            </Link>
            <Link
              href="/manager/staff-training"
              className="flex items-center gap-3 p-4 sm:p-3 border border-border rounded-full active:bg-accent active:border-spirits-magenta/50 sm:hover:bg-accent sm:hover:border-spirits-magenta/50 transition-all touch-manipulation min-h-[44px]"
            >
              <ListChecks className="h-5 w-5 text-spirits-magenta flex-shrink-0" />
              <div className="text-sm font-medium text-card-foreground">Staff training</div>
            </Link>
            <Link
              href="/manager/notices/post"
              className="flex items-center gap-3 p-4 sm:p-3 border border-border rounded-full active:bg-accent active:border-spirits-magenta/50 sm:hover:bg-accent sm:hover:border-spirits-magenta/50 transition-all touch-manipulation min-h-[44px]"
            >
              <FileText className="h-5 w-5 text-spirits-magenta flex-shrink-0" />
              <div className="text-sm font-medium text-card-foreground">Post Notice</div>
            </Link>
            <Link
              href="/manager/meetings"
              className="flex items-center gap-3 p-4 sm:p-3 border border-border rounded-full active:bg-accent active:border-spirits-magenta/50 sm:hover:bg-accent sm:hover:border-spirits-magenta/50 transition-all touch-manipulation min-h-[44px]"
            >
              <Calendar className="h-5 w-5 text-spirits-magenta flex-shrink-0" />
              <div className="text-sm font-medium text-card-foreground">Meetings</div>
            </Link>
            <Link
              href="/manager/management-calendar"
              className="flex items-center gap-3 p-4 sm:p-3 border border-border rounded-full active:bg-accent active:border-spirits-magenta/50 sm:hover:bg-accent sm:hover:border-spirits-magenta/50 transition-all touch-manipulation min-h-[44px]"
            >
              <Calendar className="h-5 w-5 text-spirits-magenta flex-shrink-0" />
              <div className="text-sm font-medium text-card-foreground">Management Calendar</div>
            </Link>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mt-3 mb-1 px-1">
              Badges
            </h3>
            <Link
              href="/manager/achievements"
              className="flex items-center gap-3 p-4 sm:p-3 border border-border rounded-full active:bg-accent active:border-spirits-cyan/50 sm:hover:bg-accent sm:hover:border-spirits-cyan/50 transition-all touch-manipulation min-h-[44px]"
            >
              <Award className="h-5 w-5 text-spirits-cyan flex-shrink-0" />
              <div className="text-sm font-medium text-card-foreground">Staff Badges</div>
            </Link>
            <Link
              href="/manager/achievements/create"
              className="flex items-center gap-3 p-4 sm:p-3 border border-border rounded-full active:bg-accent active:border-spirits-cyan/50 sm:hover:bg-accent sm:hover:border-spirits-cyan/50 transition-all touch-manipulation min-h-[44px]"
            >
              <Award className="h-5 w-5 text-spirits-cyan flex-shrink-0" />
              <div className="text-sm font-medium text-card-foreground">Create Badges</div>
            </Link>
            <Link
              href="/manager/badge-requests"
              className="flex items-center gap-3 p-4 sm:p-3 border border-border rounded-full active:bg-accent active:border-spirits-cyan/50 sm:hover:bg-accent sm:hover:border-spirits-cyan/50 transition-all touch-manipulation min-h-[44px]"
            >
              <ClipboardCheck className="h-5 w-5 text-spirits-cyan flex-shrink-0" />
              <div className="text-sm font-medium text-card-foreground">Approve badge requests</div>
            </Link>
          </div>
        )
      case 'admin':
        return (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-card-foreground mb-1 px-1">Admin</h3>
            <Link
              href="/admin/holidays/approve"
              className="flex items-center gap-3 p-4 sm:p-3 border border-border rounded-full active:bg-accent active:border-garrison-orange/50 sm:hover:bg-accent sm:hover:border-garrison-orange/50 transition-all touch-manipulation min-h-[44px]"
            >
              <CheckCircle className="h-5 w-5 text-garrison-orange flex-shrink-0" />
              <div className="text-sm font-medium text-card-foreground">Approve Holidays</div>
            </Link>
            <Link
              href="/admin/disciplinaries"
              className="flex items-center gap-3 p-4 sm:p-3 border border-border rounded-full active:bg-accent active:border-red-500/50 sm:hover:bg-accent sm:hover:border-red-500/50 transition-all touch-manipulation min-h-[44px]"
            >
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <div className="text-sm font-medium text-card-foreground">Disciplinaries</div>
            </Link>
            <Link
              href="/admin/blog"
              className="flex items-center gap-3 p-4 sm:p-3 border border-border rounded-full active:bg-accent active:border-spirits-cyan/50 sm:hover:bg-accent sm:hover:border-spirits-cyan/50 transition-all touch-manipulation min-h-[44px]"
            >
              <Newspaper className="h-5 w-5 text-spirits-cyan flex-shrink-0" />
              <div className="text-sm font-medium text-card-foreground">Blog</div>
            </Link>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mt-3 mb-1 px-1">
              Legal
            </h3>
            <Link
              href="/admin/bardisc"
              className="flex items-center gap-3 p-4 sm:p-3 border border-border rounded-full active:bg-accent active:border-garrison-orange/50 sm:hover:bg-accent sm:hover:border-garrison-orange/50 transition-all touch-manipulation min-h-[44px]"
            >
              <Scale className="h-5 w-5 text-garrison-orange flex-shrink-0" />
              <div className="text-sm font-medium text-card-foreground">Barred Disclaimers</div>
            </Link>
          </div>
        )
      default:
        return null
    }
  }

  if (!activeItem) return null

  return (
    <div className="w-full transition-all duration-300 ease-out opacity-100 translate-y-0 pointer-events-auto order-first">
      <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-lg shadow-xl p-3 sm:p-3 mx-auto w-full">
        {renderContent()}
      </div>
    </div>
  )
}
