'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { DockItem, DockIcon, useDockContext } from '@/components/core/dock'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import {
  Home,
  Calendar,
  GraduationCap,
  MessageSquare,
  Lightbulb,
  Briefcase,
  Shield,
  ArrowLeft,
  Plus,
  ListFilter,
  ArrowUpDown,
  LayoutGrid,
  StickyNote,
  Check,
  Circle,
  X,
  Loader2,
} from 'lucide-react'
import type { User } from '@/types/database'
import {
  HOLIDAYS_ADD,
  HOLIDAYS_DAY_CANCEL,
  HOLIDAYS_DAY_CONFIRM,
  HOLIDAYS_DAY_NOTES_CHANGE,
  HOLIDAYS_DAY_SET_STATUS,
  HOLIDAYS_DOCK_BACK,
  HOLIDAYS_SET_VIEW,
  HOLIDAYS_SYNC,
  type HolidaysDockSyncDetail,
  type HolidaysViewMode,
} from '@/lib/holidays-dock-bridge'

interface DockButtonRowProps {
  user: User
}

type SortOption = 'recent' | 'most_liked' | 'most_disliked' | 'oldest'
type FilterOption = 'All' | 'Garrison' | 'Spirits' | 'Bassment'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'most_liked', label: 'Most Liked' },
  { value: 'most_disliked', label: 'Most Disliked' },
  { value: 'oldest', label: 'Oldest' },
]

const FILTER_OPTIONS: { value: FilterOption; label: string }[] = [
  { value: 'All', label: 'All Venues' },
  { value: 'Garrison', label: 'Garrison' },
  { value: 'Spirits', label: 'Spirits Bar & Games' },
  { value: 'Bassment', label: 'Bassment' },
]

export function DockButtonRow({ user }: DockButtonRowProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { activeItem: dockCategoryOpen } = useDockContext()
  const isDashboard = pathname === '/dashboard'
  const isHolidaysPage = pathname.startsWith('/holidays')
  const isIdeasPage = pathname.startsWith('/ideas')
  const [showHolidaysDock, setShowHolidaysDock] = useState(isHolidaysPage)
  const [holidaysMenuOpen, setHolidaysMenuOpen] = useState<'view' | 'availability' | 'notes' | null>(null)
  const [holidaysSync, setHolidaysSync] = useState<HolidaysDockSyncDetail | null>(null)
  const [notesDraft, setNotesDraft] = useState('')
  const [showIdeasDock, setShowIdeasDock] = useState(isIdeasPage)
  const [ideasMenuOpen, setIdeasMenuOpen] = useState<'sort' | 'filter' | null>(null)
  const [selectedSort, setSelectedSort] = useState<SortOption>('recent')
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('All')
  const dockRowRef = useRef<HTMLDivElement | null>(null)
  const transition = {
    type: 'spring' as const,
    bounce: 0.1,
    duration: 0.25,
  }
  const dockSwitchTransition = {
    type: 'spring' as const,
    bounce: 0.18,
    duration: 0.38,
  }

  useEffect(() => {
    if (isHolidaysPage) {
      setShowHolidaysDock(true)
    }
  }, [isHolidaysPage])

  useEffect(() => {
    if (isIdeasPage) {
      setShowIdeasDock(true)
    }
  }, [isIdeasPage])

  useEffect(() => {
    const onSync = (e: Event) => {
      const ce = e as CustomEvent<HolidaysDockSyncDetail>
      if (ce.detail) setHolidaysSync(ce.detail)
    }
    window.addEventListener(HOLIDAYS_SYNC, onSync)
    return () => window.removeEventListener(HOLIDAYS_SYNC, onSync)
  }, [])

  useEffect(() => {
    if (holidaysMenuOpen === 'notes' && holidaysSync?.dayEdit) {
      setNotesDraft(holidaysSync.dayEdit.notes)
    }
  }, [holidaysMenuOpen, holidaysSync?.dayEdit?.notes])

  useEffect(() => {
    if (!isIdeasPage || showIdeasDock) return

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node
      if (dockRowRef.current?.contains(target)) return
      setShowIdeasDock(true)
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isIdeasPage, showIdeasDock])

  useEffect(() => {
    if (!isIdeasPage || !showIdeasDock) return

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node
      if (dockRowRef.current?.contains(target)) return
      setIdeasMenuOpen(null)
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isIdeasPage, showIdeasDock])

  useEffect(() => {
    if (dockCategoryOpen) {
      setIdeasMenuOpen(null)
      setHolidaysMenuOpen(null)
    }
  }, [dockCategoryOpen])

  const holidaysPhase = holidaysSync?.phase ?? 'browse'
  const holidaysView = holidaysSync?.view ?? 'calendar'

  useEffect(() => {
    if (!isHolidaysPage || showHolidaysDock || holidaysPhase === 'day_edit') return

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node
      if (dockRowRef.current?.contains(target)) return
      setShowHolidaysDock(true)
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isHolidaysPage, showHolidaysDock, holidaysPhase])

  useEffect(() => {
    if (!isHolidaysPage || !showHolidaysDock || holidaysPhase === 'day_edit') return

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node
      if (dockRowRef.current?.contains(target)) return
      setHolidaysMenuOpen(null)
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isHolidaysPage, showHolidaysDock, holidaysPhase])
  
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

  const openIdeaModal = () => {
    window.dispatchEvent(new CustomEvent('ideas:open-modal'))
  }

  const setIdeaSort = (sort: SortOption) => {
    setSelectedSort(sort)
    window.dispatchEvent(new CustomEvent('ideas:set-sort', { detail: { sort } }))
  }

  const setIdeaFilter = (filter: FilterOption) => {
    setSelectedFilter(filter)
    window.dispatchEvent(new CustomEvent('ideas:set-filter', { detail: { filter } }))
  }

  const mainDockRow = (
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

  if (isHolidaysPage) {
    const openHolidaysPanelTitle =
      holidaysMenuOpen === 'view'
        ? 'View'
        : holidaysMenuOpen === 'availability'
          ? 'Availability'
          : holidaysMenuOpen === 'notes'
            ? holidaysSync?.dayEdit?.dateLabel
              ? `Notes · ${holidaysSync.dayEdit.dateLabel}`
              : 'Notes'
            : null

    const setHolidayView = (view: HolidaysViewMode) => {
      window.dispatchEvent(new CustomEvent(HOLIDAYS_SET_VIEW, { detail: { view } }))
      setHolidaysMenuOpen(null)
    }

    const statusDotClass = (s: 'green' | 'yellow' | 'red') =>
      s === 'green'
        ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.45)]'
        : s === 'yellow'
          ? 'bg-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.45)]'
          : 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.45)]'

    const currentStatus = holidaysSync?.dayEdit?.status ?? 'green'

    const showHolidaysDropup =
      showHolidaysDock &&
      Boolean(holidaysMenuOpen) &&
      ((holidaysMenuOpen === 'view' && holidaysPhase === 'browse') ||
        (holidaysPhase === 'day_edit' &&
          (holidaysMenuOpen === 'availability' || holidaysMenuOpen === 'notes')))

    return (
      <MotionConfig transition={transition}>
        <div ref={dockRowRef} className="relative w-full min-h-16 sm:min-h-20">
          {showHolidaysDropup && (
            <AnimatePresence initial={false}>
              <motion.div
                key={holidaysMenuOpen ?? 'none'}
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: 10, height: 0 }}
                className="absolute bottom-full left-0 right-0 z-[1] mb-2 overflow-hidden"
              >
                <div className="rounded-2xl border border-white/10 bg-[#171717] p-2 shadow-2xl">
                  <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {openHolidaysPanelTitle}
                  </p>

                  {holidaysMenuOpen === 'view' && (
                      <div className="grid gap-1">
                        {(
                          [
                            { value: 'calendar' as const, label: 'Calendar' },
                            { value: 'upcoming_list' as const, label: 'Upcoming list' },
                            { value: 'previous_list' as const, label: 'Previous list' },
                          ] as const
                        ).map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setHolidayView(opt.value)}
                            className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                              holidaysView === opt.value
                                ? 'bg-spirits-cyan/20 text-spirits-cyan'
                                : 'text-foreground sm:hover:bg-accent'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}

                  {holidaysMenuOpen === 'availability' && (
                      <div className="grid gap-2 px-1 pb-1">
                        {(
                          [
                            { value: 'green' as const, label: 'Available' },
                            { value: 'yellow' as const, label: 'Limited' },
                            { value: 'red' as const, label: 'Unavailable' },
                          ] as const
                        ).map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              window.dispatchEvent(
                                new CustomEvent(HOLIDAYS_DAY_SET_STATUS, { detail: { status: opt.value } })
                              )
                              setHolidaysMenuOpen(null)
                            }}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                              currentStatus === opt.value
                                ? 'bg-spirits-cyan/15 text-spirits-cyan'
                                : 'text-foreground sm:hover:bg-accent'
                            }`}
                          >
                            <span className={`h-4 w-4 shrink-0 rounded-full ${statusDotClass(opt.value)}`} />
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}

                  {holidaysMenuOpen === 'notes' && (
                      <div className="px-1 pb-1">
                        <textarea
                          value={notesDraft}
                          onChange={(e) => {
                            const v = e.target.value
                            setNotesDraft(v)
                            window.dispatchEvent(new CustomEvent(HOLIDAYS_DAY_NOTES_CHANGE, { detail: { notes: v } }))
                          }}
                          rows={4}
                          placeholder="Notes for this day…"
                          className="min-h-[100px] w-full resize-y rounded-lg border border-border/60 bg-background/80 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spirits-cyan/40"
                        />
                      </div>
                    )}
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          <AnimatePresence mode="wait" initial={false}>
            {showHolidaysDock && holidaysPhase === 'day_edit' ? (
              <motion.div
                key="holidays-day-edit"
                transition={dockSwitchTransition}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                className="relative flex min-h-16 flex-col justify-center gap-1 px-2 py-1 sm:min-h-20 sm:px-4"
              >
                {holidaysSync?.dayEdit?.error ? (
                  <p className="px-1 text-center text-[11px] leading-tight text-red-400">
                    {holidaysSync.dayEdit.error}
                  </p>
                ) : null}
                <div className="grid w-full grid-cols-4 items-center gap-0 px-0 sm:px-1">
                  <button
                    type="button"
                    onClick={() => {
                      setHolidaysMenuOpen(null)
                      window.dispatchEvent(new CustomEvent(HOLIDAYS_DAY_CANCEL))
                    }}
                    className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground transition-colors active:scale-95 sm:hover:bg-white/[0.06] sm:hover:text-foreground"
                    aria-label="Cancel"
                  >
                    <X className="h-6 w-6 sm:h-7 sm:w-7" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setHolidaysMenuOpen((p) => (p === 'availability' ? null : 'availability'))
                    }
                    disabled={holidaysSync?.dayEdit?.fetching}
                    className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl transition-transform active:scale-95 sm:hover:bg-white/[0.04] disabled:opacity-40"
                    aria-label="Set availability colour"
                  >
                    <Circle
                      className={`h-7 w-7 fill-current ${currentStatus === 'green' ? 'text-green-500' : currentStatus === 'yellow' ? 'text-yellow-400' : 'text-red-500'}`}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => setHolidaysMenuOpen((p) => (p === 'notes' ? null : 'notes'))}
                    disabled={holidaysSync?.dayEdit?.fetching}
                    className={`mx-auto flex h-11 w-11 items-center justify-center rounded-xl transition-transform active:scale-95 sm:hover:bg-white/[0.04] disabled:opacity-40 ${
                      holidaysMenuOpen === 'notes' ? 'bg-spirits-cyan/10' : ''
                    }`}
                    aria-label="Edit notes"
                  >
                    <StickyNote
                      className={`h-5 w-5 sm:h-6 sm:w-6 ${holidaysMenuOpen === 'notes' ? 'text-spirits-cyan' : 'text-foreground'}`}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setHolidaysMenuOpen(null)
                      window.dispatchEvent(new CustomEvent(HOLIDAYS_DAY_CONFIRM))
                    }}
                    disabled={
                      holidaysSync?.dayEdit?.fetching ||
                      holidaysSync?.dayEdit?.submitting
                    }
                    className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl text-spirits-cyan transition-colors active:scale-95 sm:hover:bg-spirits-cyan/15 disabled:opacity-40"
                    aria-label="Save day"
                  >
                    {holidaysSync?.dayEdit?.submitting ? (
                      <Loader2 className="h-6 w-6 animate-spin sm:h-7 sm:w-7" />
                    ) : (
                      <Check className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.5} />
                    )}
                  </button>
                </div>
              </motion.div>
            ) : showHolidaysDock ? (
              <motion.div
                key="holidays-dock"
                transition={dockSwitchTransition}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                className="flex items-center justify-between w-full px-4 sm:px-6 h-16 sm:h-20 relative"
              >
                <div className="relative flex h-full flex-shrink-0 flex-col items-center justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setHolidaysMenuOpen(null)
                      setShowHolidaysDock(false)
                      window.dispatchEvent(new CustomEvent(HOLIDAYS_DOCK_BACK))
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-lg p-2 transition-all touch-manipulation active:scale-95 sm:h-12 sm:w-12 sm:hover:scale-105"
                    aria-label="Show main dock"
                  >
                    <ArrowLeft className="h-6 w-6 text-foreground transition-colors sm:h-7 sm:w-7" />
                  </button>
                </div>

                <div className="relative flex h-full flex-shrink-0 flex-col items-center justify-center">
                  <button
                    type="button"
                    onClick={() => setHolidaysMenuOpen((p) => (p === 'view' ? null : 'view'))}
                    className="flex h-10 w-10 items-center justify-center rounded-lg p-2 transition-all touch-manipulation active:scale-95 sm:h-12 sm:w-12 sm:hover:scale-105"
                    aria-label="Choose holidays view"
                  >
                    <LayoutGrid
                      className={`h-6 w-6 transition-colors sm:h-7 sm:w-7 ${
                        holidaysMenuOpen === 'view' ? 'text-spirits-cyan' : 'text-foreground'
                      }`}
                    />
                  </button>
                </div>

                <div className="relative flex h-full flex-shrink-0 flex-col items-center justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setHolidaysMenuOpen(null)
                      window.dispatchEvent(new CustomEvent(HOLIDAYS_ADD))
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-spirits-cyan/15 p-2 transition-all touch-manipulation active:scale-95 sm:h-12 sm:w-12 sm:hover:scale-105"
                    aria-label={user.role === 'admin' ? 'Add holiday for staff' : 'Book time off'}
                  >
                    <Plus className="h-6 w-6 text-spirits-cyan transition-colors sm:h-7 sm:w-7" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="holidays-main-dock"
                transition={dockSwitchTransition}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
              >
                {mainDockRow}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </MotionConfig>
    )
  }

  if (isIdeasPage) {
    const openPanelTitle = ideasMenuOpen === 'filter' ? 'Filter Ideas' : ideasMenuOpen === 'sort' ? 'Sort Ideas' : null

    return (
      <MotionConfig transition={transition}>
        <div ref={dockRowRef} className="relative w-full min-h-16 sm:min-h-20">
          {showIdeasDock && (
            <AnimatePresence initial={false}>
              {ideasMenuOpen && (
                <motion.div
                  key={ideasMenuOpen}
                  initial={{ opacity: 0, y: 10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: 10, height: 0 }}
                  className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden z-[1]"
                >
                  <div className="rounded-2xl border border-white/10 bg-[#171717] shadow-2xl p-2">
                    <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {openPanelTitle}
                    </p>
                    <div className="grid gap-1">
                      {ideasMenuOpen === 'filter' &&
                        FILTER_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setIdeaFilter(option.value)
                              setIdeasMenuOpen(null)
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                              selectedFilter === option.value
                                ? 'bg-spirits-cyan/20 text-spirits-cyan'
                                : 'text-foreground sm:hover:bg-accent'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      {ideasMenuOpen === 'sort' &&
                        SORT_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setIdeaSort(option.value)
                              setIdeasMenuOpen(null)
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                              selectedSort === option.value
                                ? 'bg-spirits-cyan/20 text-spirits-cyan'
                                : 'text-foreground sm:hover:bg-accent'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          <AnimatePresence mode="wait" initial={false}>
            {showIdeasDock ? (
              <motion.div
                key="ideas-dock"
                transition={dockSwitchTransition}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                className="flex items-center justify-between w-full px-4 sm:px-6 h-16 sm:h-20 relative"
              >
                <div className="flex-shrink-0 flex flex-col items-center h-full justify-center relative">
                  <button
                    onClick={() => {
                      setIdeasMenuOpen(null)
                      setShowIdeasDock(false)
                    }}
                    className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-lg p-2 transition-all touch-manipulation active:scale-95 sm:hover:scale-105"
                    aria-label="Show main dock"
                  >
                    <ArrowLeft className="h-6 w-6 sm:h-7 sm:w-7 text-foreground transition-colors" />
                  </button>
                </div>

                <div className="flex-shrink-0 flex flex-col items-center h-full justify-center relative">
                  <button
                    onClick={() => setIdeasMenuOpen((prev) => (prev === 'filter' ? null : 'filter'))}
                    className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-lg p-2 transition-all touch-manipulation active:scale-95 sm:hover:scale-105"
                    aria-label="Open idea filter options"
                  >
                    <ListFilter
                      className={`h-6 w-6 sm:h-7 sm:w-7 transition-colors ${
                        ideasMenuOpen === 'filter' ? 'text-spirits-cyan' : 'text-foreground'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex-shrink-0 flex flex-col items-center h-full justify-center relative">
                  <button
                    onClick={() => setIdeasMenuOpen((prev) => (prev === 'sort' ? null : 'sort'))}
                    className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-lg p-2 transition-all touch-manipulation active:scale-95 sm:hover:scale-105"
                    aria-label="Open idea sort options"
                  >
                    <ArrowUpDown
                      className={`h-6 w-6 sm:h-7 sm:w-7 transition-colors ${
                        ideasMenuOpen === 'sort' ? 'text-spirits-cyan' : 'text-foreground'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex-shrink-0 flex flex-col items-center h-full justify-center relative">
                  <button
                    onClick={() => {
                      setIdeasMenuOpen(null)
                      openIdeaModal()
                    }}
                    className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-lg p-2 transition-all touch-manipulation active:scale-95 sm:hover:scale-105 bg-spirits-yellow/15"
                    aria-label="Submit an idea"
                  >
                    <Plus className="h-6 w-6 sm:h-7 sm:w-7 text-spirits-yellow transition-colors" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="main-dock"
                transition={dockSwitchTransition}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
              >
                {mainDockRow}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </MotionConfig>
    )
  }

  return <div ref={dockRowRef}>{mainDockRow}</div>
}
