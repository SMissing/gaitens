'use client'

import { useRouter, usePathname } from 'next/navigation'
import { DockItem, DockIcon } from '@/components/core/dock'
import {
  Home,
  Calendar,
  GraduationCap,
  MessageSquare,
  Lightbulb,
  Briefcase,
  Shield,
} from 'lucide-react'
import type { User } from '@/types/database'

interface DockButtonRowProps {
  user: User
}

export function DockButtonRow({ user }: DockButtonRowProps) {
  const router = useRouter()
  const pathname = usePathname()
  const isDashboard = pathname === '/dashboard'
  
  // Determine active category based on current route
  const getActiveCategory = (): string | null => {
    if (pathname === '/dashboard') return null
    if (pathname.startsWith('/holidays') || pathname.startsWith('/upcoming-events')) return 'timeoff'
    if (pathname.startsWith('/training') || pathname.startsWith('/handbook') || pathname.startsWith('/businesses')) return 'learning'
    if (pathname.startsWith('/social') || pathname.startsWith('/employee-of-the-month') || pathname.startsWith('/photo-album')) return 'community'
    if (pathname.startsWith('/ideas') || pathname.startsWith('/grievance') || pathname.startsWith('/anonymous-report')) return 'feedback'
    if (pathname.startsWith('/manager/')) return 'manager'
    if (pathname.startsWith('/admin/')) return 'admin'
    return null
  }

  const activeCategory = getActiveCategory()
  
  // Count total items (including dashboard button)
  const itemCount = 5 + (user.role === 'manager' || user.role === 'admin' ? 1 : 0) + (user.role === 'admin' ? 1 : 0)
  const hasManyItems = itemCount >= 6
  
  // Calculate icon sizes based on item count
  const iconSize = hasManyItems ? 'h-5 w-5 sm:h-6 sm:w-6' : 'h-6 w-6 sm:h-7 sm:w-7'

  const handleDashboardClick = () => {
    if (!isDashboard) {
      router.push('/dashboard')
    }
  }

  return (
    <div className="flex items-center justify-between w-full px-4 sm:px-6 h-16 sm:h-20 relative">
      {/* Dashboard Button - Far Left */}
      <div className="flex-shrink-0 flex flex-col items-center h-full justify-center relative">
        <button
          onClick={handleDashboardClick}
          className={`h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-lg p-2 transition-all touch-manipulation active:scale-95 sm:hover:scale-105 ${
            isDashboard 
              ? 'bg-spirits-cyan/20' 
              : ''
          }`}
        >
          <Home className={`${iconSize} ${isDashboard ? 'text-spirits-cyan' : 'text-foreground'} transition-colors`} />
        </button>
        {isDashboard && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full z-10" />
        )}
      </div>

      {/* Time Off */}
      <DockItem itemId="timeoff" className="flex-shrink-0 flex flex-col items-center h-full justify-center relative">
        <DockIcon className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center">
          <Calendar className={`${iconSize} text-foreground transition-colors`} />
        </DockIcon>
        {activeCategory === 'timeoff' && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full z-10" />
        )}
      </DockItem>

      {/* Learning */}
      <DockItem itemId="learning" className="flex-shrink-0 flex flex-col items-center h-full justify-center relative">
        <DockIcon className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center">
          <GraduationCap className={`${iconSize} text-foreground transition-colors`} />
        </DockIcon>
        {activeCategory === 'learning' && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full z-10" />
        )}
      </DockItem>

      {/* Community */}
      <DockItem itemId="community" className="flex-shrink-0 flex flex-col items-center h-full justify-center relative">
        <DockIcon className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center">
          <MessageSquare className={`${iconSize} text-foreground transition-colors`} />
        </DockIcon>
        {activeCategory === 'community' && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full z-10" />
        )}
      </DockItem>

      {/* Feedback */}
      <DockItem itemId="feedback" className="flex-shrink-0 flex flex-col items-center h-full justify-center relative">
        <DockIcon className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center">
          <Lightbulb className={`${iconSize} text-foreground transition-colors`} />
        </DockIcon>
        {activeCategory === 'feedback' && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full z-10" />
        )}
      </DockItem>

      {/* Manager Tools */}
      {(user.role === 'manager' || user.role === 'admin') && (
        <DockItem itemId="manager" className="flex-shrink-0 flex flex-col items-center h-full justify-center relative">
          <DockIcon className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center">
            <Briefcase className={`${iconSize} text-spirits-magenta transition-colors`} />
          </DockIcon>
          {activeCategory === 'manager' && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full z-10" />
          )}
        </DockItem>
      )}

      {/* Admin Tools */}
      {user.role === 'admin' && (
        <DockItem itemId="admin" className="flex-shrink-0 flex flex-col items-center h-full justify-center relative">
          <DockIcon className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center">
            <Shield className={`${iconSize} text-garrison-orange transition-colors`} />
          </DockIcon>
          {activeCategory === 'admin' && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full z-10" />
          )}
        </DockItem>
      )}
    </div>
  )
}
