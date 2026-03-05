'use client'

import Link from 'next/link'
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
              className="flex items-center gap-3 p-3 border border-border rounded-full hover:bg-accent hover:border-spirits-cyan/50 transition-all"
            >
              <BookOpen className="h-5 w-5 text-spirits-cyan flex-shrink-0" />
              <div className="text-sm font-medium text-card-foreground">Handbook</div>
            </Link>
            <Link
              href="/businesses"
              className="flex items-center gap-3 p-3 border border-border rounded-full hover:bg-accent hover:border-spirits-cyan/50 transition-all"
            >
              <Building2 className="h-5 w-5 text-spirits-cyan flex-shrink-0" />
              <div className="text-sm font-medium text-card-foreground">Businesses</div>
            </Link>
          </div>
        )
      case 'timeoff':
        return (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-card-foreground mb-1 px-1">Time Off</h3>
            <Link
              href="/holidays"
              className="flex items-center gap-3 p-3 border border-border rounded-full hover:bg-accent hover:border-spirits-magenta/50 transition-all"
            >
              <Calendar className="h-5 w-5 text-spirits-magenta flex-shrink-0" />
              <div className="text-sm font-medium text-card-foreground">Holidays</div>
            </Link>
          </div>
        )
      case 'learning':
        return (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-card-foreground mb-1 px-1">Learning</h3>
            <Link
              href="/training"
              className="flex items-center gap-3 p-3 border border-border rounded-full hover:bg-accent hover:border-spirits-yellow/50 transition-all"
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
              className="flex items-center gap-3 p-3 border border-border rounded-full hover:bg-accent hover:border-spirits-cyan/50 transition-all"
            >
              <MessageSquare className="h-5 w-5 text-spirits-cyan flex-shrink-0" />
              <div className="text-sm font-medium text-card-foreground">Social</div>
            </Link>
            <Link
              href="/employee-of-the-month"
              className="flex items-center gap-3 p-3 border border-border rounded-full hover:bg-accent hover:border-spirits-yellow/50 transition-all"
            >
              <Award className="h-5 w-5 text-spirits-yellow flex-shrink-0" />
              <div className="text-sm font-medium text-card-foreground">Employee of the Month</div>
            </Link>
          </div>
        )
      case 'feedback':
        return (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-card-foreground mb-1 px-1">Feedback</h3>
            <Link
              href="/ideas"
              className="flex items-center gap-3 p-3 border border-border rounded-full hover:bg-accent hover:border-spirits-yellow/50 transition-all"
            >
              <Lightbulb className="h-5 w-5 text-spirits-yellow flex-shrink-0" />
              <div className="text-sm font-medium text-card-foreground">Ideas</div>
            </Link>
            <Link
              href="/grievance"
              className="flex items-center gap-3 p-3 border border-border rounded-full hover:bg-accent hover:border-garrison-orange/50 transition-all"
            >
              <FileText className="h-5 w-5 text-garrison-orange flex-shrink-0" />
              <div className="text-sm font-medium text-card-foreground">Grievance</div>
            </Link>
          </div>
        )
      case 'manager':
        return (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-card-foreground mb-1 px-1">Manager</h3>
            <Link
              href="/manager/staff"
              className="flex items-center gap-3 p-3 border border-border rounded-full hover:bg-accent hover:border-spirits-magenta/50 transition-all"
            >
              <Users className="h-5 w-5 text-spirits-magenta flex-shrink-0" />
              <div className="text-sm font-medium text-card-foreground">Manage Staff</div>
            </Link>
            <Link
              href="/manager/notices/post"
              className="flex items-center gap-3 p-3 border border-border rounded-full hover:bg-accent hover:border-spirits-magenta/50 transition-all"
            >
              <FileText className="h-5 w-5 text-spirits-magenta flex-shrink-0" />
              <div className="text-sm font-medium text-card-foreground">Post Notice</div>
            </Link>
            <Link
              href="/manager/meetings"
              className="flex items-center gap-3 p-3 border border-border rounded-full hover:bg-accent hover:border-spirits-magenta/50 transition-all"
            >
              <Calendar className="h-5 w-5 text-spirits-magenta flex-shrink-0" />
              <div className="text-sm font-medium text-card-foreground">Meetings</div>
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
      <div className="bg-card/80 backdrop-blur-md border border-border/50 rounded-lg shadow-xl p-3 mx-auto w-full">
        {renderContent()}
      </div>
    </div>
  )
}
