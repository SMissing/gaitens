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
  RefreshCw,
  Gamepad2,
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
import {
  STAFF_DOCK_ADD_ACCOUNT,
  STAFF_DOCK_CLOSE_FORM,
  STAFF_DOCK_STATE,
  type StaffDockStateDetail,
} from '@/lib/staff-dock-bridge'
import {
  BARRED_DOCK_ADD,
  BARRED_DOCK_CLOSE_ADD,
  BARRED_DOCK_REFRESH,
  BARRED_DOCK_SET_VIEW,
  BARRED_DOCK_STATE,
  type BarredDockStateDetail,
} from '@/lib/barred-dock-bridge'
import {
  TRAINING_DOCK_ADD,
  TRAINING_DOCK_CLOSE_FORM,
  TRAINING_DOCK_SUBMIT_FORM,
  TRAINING_DOCK_REFRESH,
  TRAINING_DOCK_STATE,
  type TrainingDockStateDetail,
} from '@/lib/training-dock-bridge'
import {
  NOTICES_POST_DOCK_CANCEL,
  NOTICES_POST_DOCK_STATE,
  NOTICES_POST_DOCK_SUBMIT,
  type NoticesPostDockStateDetail,
} from '@/lib/notices-post-dock-bridge'
import {
  MEETINGS_DOCK_ADD,
  MEETINGS_DOCK_CLOSE_FORM,
  MEETINGS_DOCK_REFRESH,
  MEETINGS_DOCK_STATE,
  MEETINGS_DOCK_SUBMIT_FORM,
  type MeetingsDockStateDetail,
} from '@/lib/meetings-dock-bridge'
import {
  MANAGEMENT_CAL_DOCK_ADD,
  MANAGEMENT_CAL_DOCK_CLOSE_ADD,
  MANAGEMENT_CAL_DOCK_CLOSE_DAY,
  MANAGEMENT_CAL_DOCK_CLOSE_EDIT,
  MANAGEMENT_CAL_DOCK_REFRESH,
  MANAGEMENT_CAL_DOCK_STATE,
  type ManagementCalDockStateDetail,
} from '@/lib/management-calendar-dock-bridge'
import {
  STAFF_BADGES_DOCK_REFRESH,
  STAFF_BADGES_DOCK_SET_FILTER,
  STAFF_BADGES_DOCK_SET_SORT,
  STAFF_BADGES_FILTER_OPTIONS,
  STAFF_BADGES_SORT_OPTIONS,
  STAFF_TRAINING_SORT_OPTIONS,
  type StaffBadgesSortOption,
  type StaffBadgesVenueFilter,
} from '@/lib/staff-badges-dock-bridge'

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

type AppFeedbackSortOption = 'recent' | 'oldest'
type AppFeedbackFilterOption = 'All' | 'feature' | 'issue' | 'question'

const APP_FEEDBACK_SORT_OPTIONS: { value: AppFeedbackSortOption; label: string }[] = [
  { value: 'recent', label: 'Most recent' },
  { value: 'oldest', label: 'Oldest' },
]

const APP_FEEDBACK_FILTER_OPTIONS: { value: AppFeedbackFilterOption; label: string }[] = [
  { value: 'All', label: 'All types' },
  { value: 'feature', label: 'Feature' },
  { value: 'issue', label: 'Issue' },
  { value: 'question', label: 'Question' },
]

export function DockButtonRow({ user }: DockButtonRowProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { activeItem: dockCategoryOpen } = useDockContext()
  const isDashboard = pathname === '/dashboard'
  const isHolidaysPage = pathname.startsWith('/holidays')
  const isIdeasPage = pathname.startsWith('/ideas')
  const isAppFeedbackPage = pathname.startsWith('/app-feedback')
  const isManageStaffPage = pathname.startsWith('/manager/staff')
  const isBarredPage = pathname.startsWith('/manager/barred')
  const isMeetingsPage = pathname.startsWith('/manager/meetings')
  const isManagementCalPage = pathname.startsWith('/manager/management-calendar')
  const isManagerAchievementsPage =
    pathname.startsWith('/manager/achievements') &&
    !pathname.startsWith('/manager/achievements/create')
  const isManagerStaffTrainingPage = pathname.startsWith('/manager/staff-training')
  const isManagerStaffBadgesDockPage =
    isManagerAchievementsPage || isManagerStaffTrainingPage
  const isModuleMakerPage = pathname.startsWith('/manager/training')
  const isNoticesPostPage =
    pathname === '/manager/notices/post' ||
    pathname.startsWith('/notices/edit/')
  const [showHolidaysDock, setShowHolidaysDock] = useState(isHolidaysPage)
  const [holidaysMenuOpen, setHolidaysMenuOpen] = useState<'view' | 'availability' | 'notes' | null>(null)
  const [holidaysSync, setHolidaysSync] = useState<HolidaysDockSyncDetail | null>(null)
  const [notesDraft, setNotesDraft] = useState('')
  const [showIdeasDock, setShowIdeasDock] = useState(isIdeasPage)
  const [showAppFeedbackDock, setShowAppFeedbackDock] = useState(isAppFeedbackPage)
  const [showStaffDock, setShowStaffDock] = useState(isManageStaffPage)
  const [showBarredDock, setShowBarredDock] = useState(isBarredPage)
  const [showModuleMakerDock, setShowModuleMakerDock] = useState(isModuleMakerPage)
  const [showMeetingsDock, setShowMeetingsDock] = useState(isMeetingsPage)
  const [showManagementCalDock, setShowManagementCalDock] = useState(isManagementCalPage)
  const [managementCalDockMeta, setManagementCalDockMeta] =
    useState<ManagementCalDockStateDetail>({
      addModalOpen: false,
      dayPanelOpen: false,
      editModalOpen: false,
      listLoading: true,
      saving: false,
    })
  const [meetingsDockMeta, setMeetingsDockMeta] = useState<MeetingsDockStateDetail>({
    formOpen: false,
    listLoading: true,
    saving: false,
    formBlocking: false,
  })
  const [noticesPostMeta, setNoticesPostMeta] = useState<NoticesPostDockStateDetail>({
    saving: false,
    uploading: false,
    editing: false,
  })
  const [barredMenuOpen, setBarredMenuOpen] = useState<'view' | null>(null)
  const [barredMeta, setBarredMeta] = useState<BarredDockStateDetail>({
    disclaimerAccepted: false,
    addModalOpen: false,
    activeView: 'active',
    loading: false,
  })
  const [moduleMakerMeta, setModuleMakerMeta] = useState<TrainingDockStateDetail>({
    formOpen: false,
    listLoading: true,
    saving: false,
    editing: false,
  })
  const [staffDockMeta, setStaffDockMeta] = useState<StaffDockStateDetail>({
    formOpen: false,
    canAdd: true,
  })
  const [ideasMenuOpen, setIdeasMenuOpen] = useState<'sort' | 'filter' | null>(null)
  const [selectedSort, setSelectedSort] = useState<SortOption>('recent')
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('All')
  const [appFeedbackMenuOpen, setAppFeedbackMenuOpen] = useState<'sort' | 'filter' | null>(null)
  const [selectedAppFeedbackSort, setSelectedAppFeedbackSort] =
    useState<AppFeedbackSortOption>('recent')
  const [selectedAppFeedbackFilter, setSelectedAppFeedbackFilter] =
    useState<AppFeedbackFilterOption>('All')
  const [showStaffBadgesDock, setShowStaffBadgesDock] = useState(isManagerStaffBadgesDockPage)
  const [staffBadgesMenuOpen, setStaffBadgesMenuOpen] = useState<'sort' | 'filter' | null>(null)
  const [staffBadgesSort, setStaffBadgesSort] = useState<StaffBadgesSortOption>('role_then_name')
  const [staffBadgesFilter, setStaffBadgesFilter] = useState<StaffBadgesVenueFilter>('All')
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

  /** Equal-width columns; controls stay inside the dock at any viewport width */
  const DOCK_ROW =
    'flex w-full min-w-0 items-stretch px-1.5 sm:px-3 h-16 sm:h-20 relative'
  const DOCK_ACTION_SLOT =
    'flex min-w-0 flex-1 basis-0 flex-col items-center justify-center relative'

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
    if (isAppFeedbackPage) {
      setShowAppFeedbackDock(true)
    }
  }, [isAppFeedbackPage])

  useEffect(() => {
    if (isManagerStaffBadgesDockPage) {
      setShowStaffBadgesDock(true)
    }
  }, [isManagerStaffBadgesDockPage])

  useEffect(() => {
    if (isManageStaffPage) {
      setShowStaffDock(true)
    }
  }, [isManageStaffPage])

  useEffect(() => {
    if (isBarredPage) {
      setShowBarredDock(true)
    }
  }, [isBarredPage])

  useEffect(() => {
    if (isModuleMakerPage) {
      setShowModuleMakerDock(true)
    }
  }, [isModuleMakerPage])

  useEffect(() => {
    if (isMeetingsPage) {
      setShowMeetingsDock(true)
    }
  }, [isMeetingsPage])

  useEffect(() => {
    if (isManagementCalPage) {
      setShowManagementCalDock(true)
    }
  }, [isManagementCalPage])

  useEffect(() => {
    const onManagementCalDockState = (e: Event) => {
      const ce = e as CustomEvent<ManagementCalDockStateDetail>
      if (ce.detail) setManagementCalDockMeta(ce.detail)
    }
    window.addEventListener(MANAGEMENT_CAL_DOCK_STATE, onManagementCalDockState)
    return () =>
      window.removeEventListener(
        MANAGEMENT_CAL_DOCK_STATE,
        onManagementCalDockState
      )
  }, [])

  useEffect(() => {
    const onMeetingsDockState = (e: Event) => {
      const ce = e as CustomEvent<MeetingsDockStateDetail>
      if (ce.detail) setMeetingsDockMeta(ce.detail)
    }
    window.addEventListener(MEETINGS_DOCK_STATE, onMeetingsDockState)
    return () =>
      window.removeEventListener(MEETINGS_DOCK_STATE, onMeetingsDockState)
  }, [])

  useEffect(() => {
    const onNoticesPostDockState = (e: Event) => {
      const ce = e as CustomEvent<NoticesPostDockStateDetail>
      if (ce.detail) setNoticesPostMeta(ce.detail)
    }
    window.addEventListener(NOTICES_POST_DOCK_STATE, onNoticesPostDockState)
    return () =>
      window.removeEventListener(NOTICES_POST_DOCK_STATE, onNoticesPostDockState)
  }, [])

  useEffect(() => {
    const onTrainingDockState = (e: Event) => {
      const ce = e as CustomEvent<TrainingDockStateDetail>
      if (ce.detail) setModuleMakerMeta(ce.detail)
    }
    window.addEventListener(TRAINING_DOCK_STATE, onTrainingDockState)
    return () =>
      window.removeEventListener(TRAINING_DOCK_STATE, onTrainingDockState)
  }, [])

  useEffect(() => {
    const onBarredDockState = (e: Event) => {
      const ce = e as CustomEvent<BarredDockStateDetail>
      if (ce.detail) setBarredMeta(ce.detail)
    }
    window.addEventListener(BARRED_DOCK_STATE, onBarredDockState)
    return () => window.removeEventListener(BARRED_DOCK_STATE, onBarredDockState)
  }, [])

  useEffect(() => {
    const onStaffDockState = (e: Event) => {
      const ce = e as CustomEvent<StaffDockStateDetail>
      if (ce.detail) setStaffDockMeta(ce.detail)
    }
    window.addEventListener(STAFF_DOCK_STATE, onStaffDockState)
    return () => window.removeEventListener(STAFF_DOCK_STATE, onStaffDockState)
  }, [])

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
    if (!isAppFeedbackPage || showAppFeedbackDock) return

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node
      if (dockRowRef.current?.contains(target)) return
      setShowAppFeedbackDock(true)
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isAppFeedbackPage, showAppFeedbackDock])

  useEffect(() => {
    if (!isAppFeedbackPage || !showAppFeedbackDock) return

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node
      if (dockRowRef.current?.contains(target)) return
      setAppFeedbackMenuOpen(null)
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isAppFeedbackPage, showAppFeedbackDock])

  useEffect(() => {
    if (!isManagerStaffBadgesDockPage || showStaffBadgesDock) return

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node
      if (dockRowRef.current?.contains(target)) return
      setShowStaffBadgesDock(true)
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isManagerStaffBadgesDockPage, showStaffBadgesDock])

  useEffect(() => {
    if (!isManagerStaffBadgesDockPage || !showStaffBadgesDock) return

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node
      if (dockRowRef.current?.contains(target)) return
      setStaffBadgesMenuOpen(null)
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isManagerStaffBadgesDockPage, showStaffBadgesDock])

  useEffect(() => {
    if (dockCategoryOpen) {
      setIdeasMenuOpen(null)
      setHolidaysMenuOpen(null)
      setBarredMenuOpen(null)
      setStaffBadgesMenuOpen(null)
    }
  }, [dockCategoryOpen])

  useEffect(() => {
    if (!isManageStaffPage || showStaffDock) return

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node
      if (dockRowRef.current?.contains(target)) return
      setShowStaffDock(true)
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isManageStaffPage, showStaffDock])

  useEffect(() => {
    if (!isBarredPage || !barredMeta.disclaimerAccepted || showBarredDock) return

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node
      if (dockRowRef.current?.contains(target)) return
      setShowBarredDock(true)
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isBarredPage, barredMeta.disclaimerAccepted, showBarredDock])

  useEffect(() => {
    if (!isBarredPage || !barredMeta.disclaimerAccepted || !showBarredDock) return

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node
      if (dockRowRef.current?.contains(target)) return
      setBarredMenuOpen(null)
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isBarredPage, barredMeta.disclaimerAccepted, showBarredDock])

  useEffect(() => {
    if (!isModuleMakerPage || showModuleMakerDock) return

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node
      if (dockRowRef.current?.contains(target)) return
      setShowModuleMakerDock(true)
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isModuleMakerPage, showModuleMakerDock])

  useEffect(() => {
    if (!isMeetingsPage || showMeetingsDock) return

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node
      if (dockRowRef.current?.contains(target)) return
      setShowMeetingsDock(true)
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isMeetingsPage, showMeetingsDock])

  useEffect(() => {
    if (!isManagementCalPage || showManagementCalDock) return

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node
      if (dockRowRef.current?.contains(target)) return
      setShowManagementCalDock(true)
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isManagementCalPage, showManagementCalDock])

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
    if (
      pathname.startsWith('/holidays') ||
      pathname.startsWith('/upcoming-events') ||
      pathname.startsWith('/past-events')
    )
      return 'timeoff'
    if (pathname.startsWith('/training') || pathname.startsWith('/handbook') || pathname.startsWith('/businesses')) return 'learning'
    if (
      pathname.startsWith('/notices') ||
      pathname.startsWith('/employee-of-the-month') ||
      pathname.startsWith('/photo-album')
    )
      return 'community'
    if (
      pathname.startsWith('/ideas') ||
      pathname.startsWith('/app-feedback') ||
      pathname.startsWith('/grievance') ||
      pathname.startsWith('/anonymous-report')
    )
      return 'feedback'
    if (pathname.startsWith('/games')) return 'games'
    if (pathname.startsWith('/manager/')) return 'manager'
    if (pathname.startsWith('/admin/')) return 'admin'
    return null
  }

  const activeCategory = getActiveCategory()
  
  // Count total items (including dashboard button)
  const itemCount = 6 + (user.role === 'manager' || user.role === 'admin' ? 1 : 0) + (user.role === 'admin' ? 1 : 0)
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

  const openAppFeedbackModal = () => {
    window.dispatchEvent(new CustomEvent('app-feedback:open-modal'))
  }

  const setAppFeedbackSort = (sort: AppFeedbackSortOption) => {
    setSelectedAppFeedbackSort(sort)
    window.dispatchEvent(new CustomEvent('app-feedback:set-sort', { detail: { sort } }))
  }

  const setAppFeedbackFilter = (filter: AppFeedbackFilterOption) => {
    setSelectedAppFeedbackFilter(filter)
    window.dispatchEvent(new CustomEvent('app-feedback:set-filter', { detail: { filter } }))
  }

  const setStaffBadgesSortValue = (sort: StaffBadgesSortOption) => {
    setStaffBadgesSort(sort)
    window.dispatchEvent(
      new CustomEvent(STAFF_BADGES_DOCK_SET_SORT, { detail: { sort } }),
    )
  }

  const setStaffBadgesFilterValue = (filter: StaffBadgesVenueFilter) => {
    setStaffBadgesFilter(filter)
    window.dispatchEvent(
      new CustomEvent(STAFF_BADGES_DOCK_SET_FILTER, { detail: { filter } }),
    )
  }

  const triggerStaffBadgesRefresh = () => {
    setStaffBadgesMenuOpen(null)
    window.dispatchEvent(new CustomEvent(STAFF_BADGES_DOCK_REFRESH))
  }

  const mainDockRow = (
    <div className={DOCK_ROW}>
      {/* Dashboard Button - Far Left */}
      <div className={DOCK_ACTION_SLOT}>
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
      <DockItem itemId="timeoff" hasSubmenu className={DOCK_ACTION_SLOT}>
        <DockIcon className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center">
          <Calendar className={`${iconSize} text-foreground transition-colors`} />
        </DockIcon>
        {activeCategory === 'timeoff' && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full z-10" />
        )}
      </DockItem>

      {/* Learning */}
      <DockItem itemId="learning" hasSubmenu className={DOCK_ACTION_SLOT}>
        <DockIcon className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center">
          <GraduationCap className={`${iconSize} text-foreground transition-colors`} />
        </DockIcon>
        {activeCategory === 'learning' && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full z-10" />
        )}
      </DockItem>

      {/* Community */}
      <DockItem itemId="community" hasSubmenu className={DOCK_ACTION_SLOT}>
        <DockIcon className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center">
          <MessageSquare className={`${iconSize} text-foreground transition-colors`} />
        </DockIcon>
        {activeCategory === 'community' && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full z-10" />
        )}
      </DockItem>

      {/* Feedback */}
      <DockItem itemId="feedback" hasSubmenu className={DOCK_ACTION_SLOT}>
        <DockIcon className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center">
          <Lightbulb className={`${iconSize} text-foreground transition-colors`} />
        </DockIcon>
        {activeCategory === 'feedback' && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full z-10" />
        )}
      </DockItem>

      {/* Games — placed last among standard items */}
      <DockItem itemId="games" hasSubmenu className={DOCK_ACTION_SLOT}>
        <DockIcon className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center">
          <Gamepad2 className={`${iconSize} text-foreground transition-colors`} />
        </DockIcon>
        {activeCategory === 'games' && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full z-10" />
        )}
      </DockItem>

      {/* Manager Tools */}
      {(user.role === 'manager' || user.role === 'admin') && (
        <DockItem itemId="manager" hasSubmenu className={DOCK_ACTION_SLOT}>
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
        <DockItem itemId="admin" hasSubmenu className={DOCK_ACTION_SLOT}>
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
        <div ref={dockRowRef} className="relative w-full min-w-0 min-h-16 sm:min-h-20">
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
                            ...(user.role === 'manager' || user.role === 'admin'
                              ? [{ value: 'by_staff_list' as const, label: 'By staff' }]
                              : []),
                          ] satisfies { value: HolidaysViewMode; label: string }[]
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
                className="relative flex min-h-16 min-w-0 flex-col justify-center gap-1 px-1.5 py-1 sm:min-h-20 sm:px-3"
              >
                {holidaysSync?.dayEdit?.error ? (
                  <p className="px-1 text-center text-[11px] leading-tight text-red-400">
                    {holidaysSync.dayEdit.error}
                  </p>
                ) : null}
                <div className="grid w-full min-w-0 grid-cols-4 items-center gap-0 px-0">
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
                className={DOCK_ROW}
              >
                <div className={DOCK_ACTION_SLOT}>
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

                <div className={DOCK_ACTION_SLOT}>
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

                <div className={DOCK_ACTION_SLOT}>
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
        <div ref={dockRowRef} className="relative w-full min-w-0 min-h-16 sm:min-h-20">
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
                className={DOCK_ROW}
              >
                <div className={DOCK_ACTION_SLOT}>
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

                <div className={DOCK_ACTION_SLOT}>
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

                <div className={DOCK_ACTION_SLOT}>
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

                <div className={DOCK_ACTION_SLOT}>
                  <button
                    onClick={() => {
                      setIdeasMenuOpen(null)
                      openIdeaModal()
                    }}
                    className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-lg p-2 transition-all touch-manipulation active:scale-95 sm:hover:scale-105 bg-spirits-cyan/15"
                    aria-label="Submit an idea"
                  >
                    <Plus className="h-6 w-6 sm:h-7 sm:w-7 text-spirits-cyan transition-colors" />
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

  if (isAppFeedbackPage) {
    const appFeedbackPanelTitle =
      appFeedbackMenuOpen === 'filter'
        ? 'Filter by type'
        : appFeedbackMenuOpen === 'sort'
          ? 'Sort feedback'
          : null

    return (
      <MotionConfig transition={transition}>
        <div ref={dockRowRef} className="relative w-full min-w-0 min-h-16 sm:min-h-20">
          {showAppFeedbackDock && (
            <AnimatePresence initial={false}>
              {appFeedbackMenuOpen && (
                <motion.div
                  key={appFeedbackMenuOpen}
                  initial={{ opacity: 0, y: 10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: 10, height: 0 }}
                  className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden z-[1]"
                >
                  <div className="rounded-2xl border border-white/10 bg-[#171717] shadow-2xl p-2">
                    <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {appFeedbackPanelTitle}
                    </p>
                    <div className="grid gap-1">
                      {appFeedbackMenuOpen === 'filter' &&
                        APP_FEEDBACK_FILTER_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setAppFeedbackFilter(option.value)
                              setAppFeedbackMenuOpen(null)
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                              selectedAppFeedbackFilter === option.value
                                ? 'bg-spirits-cyan/20 text-spirits-cyan'
                                : 'text-foreground sm:hover:bg-accent'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      {appFeedbackMenuOpen === 'sort' &&
                        APP_FEEDBACK_SORT_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setAppFeedbackSort(option.value)
                              setAppFeedbackMenuOpen(null)
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                              selectedAppFeedbackSort === option.value
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
            {showAppFeedbackDock ? (
              <motion.div
                key="app-feedback-dock"
                transition={dockSwitchTransition}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                className={DOCK_ROW}
              >
                <div className={DOCK_ACTION_SLOT}>
                  <button
                    type="button"
                    onClick={() => {
                      setAppFeedbackMenuOpen(null)
                      setShowAppFeedbackDock(false)
                    }}
                    className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-lg p-2 transition-all touch-manipulation active:scale-95 sm:hover:scale-105"
                    aria-label="Show main dock"
                  >
                    <ArrowLeft className="h-6 w-6 sm:h-7 sm:w-7 text-foreground transition-colors" />
                  </button>
                </div>

                <div className={DOCK_ACTION_SLOT}>
                  <button
                    type="button"
                    onClick={() =>
                      setAppFeedbackMenuOpen((prev) => (prev === 'filter' ? null : 'filter'))
                    }
                    className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-lg p-2 transition-all touch-manipulation active:scale-95 sm:hover:scale-105"
                    aria-label="Filter app feedback by type"
                  >
                    <ListFilter
                      className={`h-6 w-6 sm:h-7 sm:w-7 transition-colors ${
                        appFeedbackMenuOpen === 'filter' ? 'text-spirits-cyan' : 'text-foreground'
                      }`}
                    />
                  </button>
                </div>

                <div className={DOCK_ACTION_SLOT}>
                  <button
                    type="button"
                    onClick={() =>
                      setAppFeedbackMenuOpen((prev) => (prev === 'sort' ? null : 'sort'))
                    }
                    className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-lg p-2 transition-all touch-manipulation active:scale-95 sm:hover:scale-105"
                    aria-label="Sort app feedback"
                  >
                    <ArrowUpDown
                      className={`h-6 w-6 sm:h-7 sm:w-7 transition-colors ${
                        appFeedbackMenuOpen === 'sort' ? 'text-spirits-cyan' : 'text-foreground'
                      }`}
                    />
                  </button>
                </div>

                <div className={DOCK_ACTION_SLOT}>
                  <button
                    type="button"
                    onClick={() => {
                      setAppFeedbackMenuOpen(null)
                      openAppFeedbackModal()
                    }}
                    className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-lg p-2 transition-all touch-manipulation active:scale-95 sm:hover:scale-105 bg-spirits-cyan/15"
                    aria-label="Submit app feedback"
                  >
                    <Plus className="h-6 w-6 sm:h-7 sm:w-7 text-spirits-cyan transition-colors" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="main-dock-app-feedback"
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

  if (isManagerStaffBadgesDockPage) {
    const staffListSortOptions = isManagerStaffTrainingPage
      ? STAFF_TRAINING_SORT_OPTIONS
      : STAFF_BADGES_SORT_OPTIONS
    const staffBadgesPanelTitle =
      staffBadgesMenuOpen === 'filter'
        ? 'Filter by venue'
        : staffBadgesMenuOpen === 'sort'
          ? isManagerStaffTrainingPage
            ? 'Sort by training'
            : 'Sort accounts'
          : null

    return (
      <MotionConfig transition={transition}>
        <div ref={dockRowRef} className="relative w-full min-w-0 min-h-16 sm:min-h-20">
          {showStaffBadgesDock && (
            <AnimatePresence initial={false}>
              {staffBadgesMenuOpen && (
                <motion.div
                  key={staffBadgesMenuOpen}
                  initial={{ opacity: 0, y: 10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: 10, height: 0 }}
                  className="absolute bottom-full left-0 right-0 z-[1] mb-2 overflow-hidden"
                >
                  <div className="rounded-2xl border border-white/10 bg-[#171717] p-2 shadow-2xl">
                    <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {staffBadgesPanelTitle}
                    </p>
                    <div className="grid gap-1">
                      {staffBadgesMenuOpen === 'filter' &&
                        STAFF_BADGES_FILTER_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setStaffBadgesFilterValue(option.value)
                              setStaffBadgesMenuOpen(null)
                            }}
                            className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                              staffBadgesFilter === option.value
                                ? 'bg-spirits-cyan/20 text-spirits-cyan'
                                : 'text-foreground sm:hover:bg-accent'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      {staffBadgesMenuOpen === 'sort' &&
                        staffListSortOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setStaffBadgesSortValue(option.value)
                              setStaffBadgesMenuOpen(null)
                            }}
                            className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                              staffBadgesSort === option.value
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
            {showStaffBadgesDock ? (
              <motion.div
                key="staff-badges-dock"
                transition={dockSwitchTransition}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                className={DOCK_ROW}
              >
                <div className={DOCK_ACTION_SLOT}>
                  <button
                    type="button"
                    onClick={() => {
                      setStaffBadgesMenuOpen(null)
                      setShowStaffBadgesDock(false)
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-lg p-2 transition-all touch-manipulation active:scale-95 sm:h-12 sm:w-12 sm:hover:scale-105"
                    aria-label="Show main dock"
                  >
                    <ArrowLeft className="h-6 w-6 text-foreground transition-colors sm:h-7 sm:w-7" />
                  </button>
                </div>

                <div className={DOCK_ACTION_SLOT}>
                  <button
                    type="button"
                    onClick={() =>
                      setStaffBadgesMenuOpen((prev) => (prev === 'filter' ? null : 'filter'))
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-lg p-2 transition-all touch-manipulation active:scale-95 sm:h-12 sm:w-12 sm:hover:scale-105"
                    aria-label="Filter by venue"
                  >
                    <ListFilter
                      className={`h-6 w-6 transition-colors sm:h-7 sm:w-7 ${
                        staffBadgesMenuOpen === 'filter' ? 'text-spirits-cyan' : 'text-foreground'
                      }`}
                    />
                  </button>
                </div>

                <div className={DOCK_ACTION_SLOT}>
                  <button
                    type="button"
                    onClick={() =>
                      setStaffBadgesMenuOpen((prev) => (prev === 'sort' ? null : 'sort'))
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-lg p-2 transition-all touch-manipulation active:scale-95 sm:h-12 sm:w-12 sm:hover:scale-105"
                    aria-label={
                      isManagerStaffTrainingPage
                        ? 'Sort by training completion'
                        : 'Sort accounts'
                    }
                  >
                    <ArrowUpDown
                      className={`h-6 w-6 transition-colors sm:h-7 sm:w-7 ${
                        staffBadgesMenuOpen === 'sort' ? 'text-spirits-cyan' : 'text-foreground'
                      }`}
                    />
                  </button>
                </div>

                <div className={DOCK_ACTION_SLOT}>
                  <button
                    type="button"
                    onClick={triggerStaffBadgesRefresh}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-spirits-cyan/15 p-2 transition-all touch-manipulation active:scale-95 sm:h-12 sm:w-12 sm:hover:scale-105"
                    aria-label={
                      isManagerStaffTrainingPage
                        ? 'Refresh training progress'
                        : 'Refresh badge list'
                    }
                  >
                    <RefreshCw className="h-6 w-6 text-spirits-cyan transition-colors sm:h-7 sm:w-7" />
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

  if (isBarredPage) {
    const setBarredView = (view: 'active' | 'past') => {
      window.dispatchEvent(
        new CustomEvent(BARRED_DOCK_SET_VIEW, { detail: { view } })
      )
      setBarredMenuOpen(null)
    }

    const showBarredDropup =
      barredMeta.disclaimerAccepted &&
      showBarredDock &&
      !barredMeta.addModalOpen &&
      barredMenuOpen === 'view'

    return (
      <MotionConfig transition={transition}>
        <div ref={dockRowRef} className="relative w-full min-w-0 min-h-16 sm:min-h-20">
          {showBarredDropup && (
            <AnimatePresence initial={false}>
              <motion.div
                key="barred-view-menu"
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: 10, height: 0 }}
                className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden z-[1]"
              >
                <div className="rounded-2xl border border-white/10 bg-[#171717] p-2 shadow-2xl">
                  <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    List view
                  </p>
                  <div className="grid gap-1">
                    <button
                      type="button"
                      onClick={() => setBarredView('active')}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        barredMeta.activeView === 'active'
                          ? 'bg-spirits-magenta/20 text-spirits-magenta'
                          : 'text-foreground sm:hover:bg-accent'
                      }`}
                    >
                      Barred list
                      {barredMeta.activeView === 'active' ? (
                        <Check className="h-4 w-4 shrink-0" />
                      ) : null}
                    </button>
                    <button
                      type="button"
                      onClick={() => setBarredView('past')}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        barredMeta.activeView === 'past'
                          ? 'bg-spirits-magenta/20 text-spirits-magenta'
                          : 'text-foreground sm:hover:bg-accent'
                      }`}
                    >
                      Past bars
                      {barredMeta.activeView === 'past' ? (
                        <Check className="h-4 w-4 shrink-0" />
                      ) : null}
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          <AnimatePresence mode="wait" initial={false}>
            {!barredMeta.disclaimerAccepted || !showBarredDock ? (
              <motion.div
                key="barred-root-main"
                transition={dockSwitchTransition}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
              >
                {mainDockRow}
              </motion.div>
            ) : barredMeta.addModalOpen ? (
              <motion.div
                key="barred-add-close"
                transition={dockSwitchTransition}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                className={DOCK_ROW}
              >
                <div className={DOCK_ACTION_SLOT}>
                  <button
                    type="button"
                    onClick={() =>
                      window.dispatchEvent(new CustomEvent(BARRED_DOCK_CLOSE_ADD))
                    }
                    className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-lg p-2 transition-all touch-manipulation active:scale-95 sm:hover:scale-105"
                    aria-label="Close add bar"
                  >
                    <ArrowLeft className="h-6 w-6 sm:h-7 sm:w-7 text-foreground transition-colors" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="barred-dock"
                transition={dockSwitchTransition}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                className={DOCK_ROW}
              >
                <div className={DOCK_ACTION_SLOT}>
                  <button
                    type="button"
                    onClick={() => {
                      setBarredMenuOpen(null)
                      setShowBarredDock(false)
                    }}
                    className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-lg p-2 transition-all touch-manipulation active:scale-95 sm:hover:scale-105"
                    aria-label="Show main dock"
                  >
                    <ArrowLeft className="h-6 w-6 sm:h-7 sm:w-7 text-foreground transition-colors" />
                  </button>
                </div>

                <div className={DOCK_ACTION_SLOT}>
                  <button
                    type="button"
                    onClick={() =>
                      setBarredMenuOpen((p) => (p === 'view' ? null : 'view'))
                    }
                    className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-lg p-2 transition-all touch-manipulation active:scale-95 sm:hover:scale-105"
                    aria-label="Choose barred list or past bars"
                  >
                    <LayoutGrid
                      className={`h-6 w-6 sm:h-7 sm:w-7 transition-colors ${
                        barredMenuOpen === 'view'
                          ? 'text-spirits-magenta'
                          : 'text-foreground'
                      }`}
                    />
                  </button>
                </div>

                <div className={DOCK_ACTION_SLOT}>
                  <button
                    type="button"
                    disabled={barredMeta.loading}
                    onClick={() => {
                      setBarredMenuOpen(null)
                      window.dispatchEvent(new CustomEvent(BARRED_DOCK_REFRESH))
                    }}
                    className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-lg p-2 transition-all touch-manipulation active:scale-95 sm:hover:scale-105 disabled:opacity-40"
                    aria-label="Refresh barred list"
                  >
                    {barredMeta.loading ? (
                      <Loader2 className="h-6 w-6 sm:h-7 sm:w-7 animate-spin text-muted-foreground" />
                    ) : (
                      <RefreshCw className="h-6 w-6 sm:h-7 sm:w-7 text-foreground transition-colors" />
                    )}
                  </button>
                </div>

                <div className={DOCK_ACTION_SLOT}>
                  <button
                    type="button"
                    onClick={() => {
                      setBarredMenuOpen(null)
                      window.dispatchEvent(new CustomEvent(BARRED_DOCK_ADD))
                    }}
                    className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-lg p-2 transition-all touch-manipulation active:scale-95 sm:hover:scale-105 bg-garrison-orange/15"
                    aria-label="Add barred person"
                  >
                    <Plus className="h-6 w-6 sm:h-7 sm:w-7 text-garrison-orange transition-colors" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </MotionConfig>
    )
  }

  if (isManagementCalPage) {
    const refreshBusy =
      managementCalDockMeta.listLoading || managementCalDockMeta.saving
    const overlayOpen =
      managementCalDockMeta.addModalOpen ||
      managementCalDockMeta.dayPanelOpen ||
      managementCalDockMeta.editModalOpen

    return (
      <MotionConfig transition={transition}>
        <div ref={dockRowRef} className="relative w-full min-w-0 min-h-16 sm:min-h-20">
          <AnimatePresence mode="wait" initial={false}>
            {!showManagementCalDock ? (
              <motion.div
                key="management-cal-main"
                transition={dockSwitchTransition}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
              >
                {mainDockRow}
              </motion.div>
            ) : overlayOpen ? (
              <motion.div
                key="management-cal-overlay"
                transition={dockSwitchTransition}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                className={DOCK_ROW}
              >
                <div className={DOCK_ACTION_SLOT}>
                  <button
                    type="button"
                    disabled={managementCalDockMeta.saving}
                    onClick={() => {
                      if (managementCalDockMeta.editModalOpen) {
                        window.dispatchEvent(
                          new CustomEvent(MANAGEMENT_CAL_DOCK_CLOSE_EDIT)
                        )
                      } else if (managementCalDockMeta.addModalOpen) {
                        window.dispatchEvent(
                          new CustomEvent(MANAGEMENT_CAL_DOCK_CLOSE_ADD)
                        )
                      } else {
                        window.dispatchEvent(
                          new CustomEvent(MANAGEMENT_CAL_DOCK_CLOSE_DAY)
                        )
                      }
                    }}
                    className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-lg p-2 transition-all touch-manipulation active:scale-95 sm:hover:scale-105 disabled:opacity-40"
                    aria-label={
                      managementCalDockMeta.editModalOpen
                        ? 'Close edit event'
                        : managementCalDockMeta.addModalOpen
                          ? 'Close add event'
                          : 'Close day details'
                    }
                  >
                    <ArrowLeft className="h-6 w-6 sm:h-7 sm:w-7 text-foreground transition-colors" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="management-cal-dock"
                transition={dockSwitchTransition}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                className={DOCK_ROW}
              >
                <div className={DOCK_ACTION_SLOT}>
                  <button
                    type="button"
                    onClick={() => setShowManagementCalDock(false)}
                    className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-lg p-2 transition-all touch-manipulation active:scale-95 sm:hover:scale-105"
                    aria-label="Show main dock"
                  >
                    <ArrowLeft className="h-6 w-6 sm:h-7 sm:w-7 text-foreground transition-colors" />
                  </button>
                </div>

                <div className={DOCK_ACTION_SLOT}>
                  <button
                    type="button"
                    disabled={refreshBusy}
                    onClick={() =>
                      window.dispatchEvent(
                        new CustomEvent(MANAGEMENT_CAL_DOCK_REFRESH)
                      )
                    }
                    className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-lg p-2 transition-all touch-manipulation active:scale-95 sm:hover:scale-105 disabled:opacity-40"
                    aria-label="Refresh calendar"
                  >
                    {managementCalDockMeta.listLoading ? (
                      <Loader2 className="h-6 w-6 sm:h-7 sm:w-7 animate-spin text-muted-foreground" />
                    ) : (
                      <RefreshCw className="h-6 w-6 sm:h-7 sm:w-7 text-foreground transition-colors" />
                    )}
                  </button>
                </div>

                <div className={DOCK_ACTION_SLOT}>
                  <button
                    type="button"
                    disabled={refreshBusy}
                    onClick={() =>
                      window.dispatchEvent(
                        new CustomEvent(MANAGEMENT_CAL_DOCK_ADD)
                      )
                    }
                    className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-lg p-2 transition-all touch-manipulation active:scale-95 sm:hover:scale-105 bg-spirits-magenta/15 disabled:opacity-40"
                    aria-label="Add management event"
                  >
                    <Plus className="h-6 w-6 sm:h-7 sm:w-7 text-spirits-magenta transition-colors" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </MotionConfig>
    )
  }

  if (isMeetingsPage) {
    const refreshBusy =
      meetingsDockMeta.listLoading || meetingsDockMeta.saving
    const formSubmitBusy =
      meetingsDockMeta.saving || meetingsDockMeta.formBlocking

    return (
      <MotionConfig transition={transition}>
        <div ref={dockRowRef} className="relative w-full min-w-0 min-h-16 sm:min-h-20">
          <AnimatePresence mode="wait" initial={false}>
            {!showMeetingsDock ? (
              <motion.div
                key="meetings-main"
                transition={dockSwitchTransition}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
              >
                {mainDockRow}
              </motion.div>
            ) : meetingsDockMeta.formOpen ? (
              <motion.div
                key="meetings-form"
                transition={dockSwitchTransition}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                className={DOCK_ROW}
              >
                <div className={DOCK_ACTION_SLOT}>
                  <button
                    type="button"
                    disabled={meetingsDockMeta.saving}
                    onClick={() =>
                      window.dispatchEvent(
                        new CustomEvent(MEETINGS_DOCK_CLOSE_FORM)
                      )
                    }
                    className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-lg p-2 transition-all touch-manipulation active:scale-95 sm:hover:scale-105 disabled:opacity-40"
                    aria-label="Cancel — back to meetings list"
                  >
                    <X className="h-6 w-6 sm:h-7 sm:w-7 text-foreground transition-colors" />
                  </button>
                </div>

                <div className={DOCK_ACTION_SLOT}>
                  <button
                    type="button"
                    disabled={formSubmitBusy}
                    onClick={() =>
                      window.dispatchEvent(
                        new CustomEvent(MEETINGS_DOCK_SUBMIT_FORM)
                      )
                    }
                    className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-lg p-2 transition-all touch-manipulation active:scale-95 sm:hover:scale-105 bg-spirits-cyan/15 disabled:opacity-40"
                    aria-label="Send meeting request"
                  >
                    {meetingsDockMeta.saving ? (
                      <Loader2 className="h-6 w-6 sm:h-7 sm:w-7 animate-spin text-spirits-cyan" />
                    ) : (
                      <Check
                        className="h-6 w-6 sm:h-7 sm:w-7 text-spirits-cyan transition-colors"
                        strokeWidth={2.5}
                      />
                    )}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="meetings-dock"
                transition={dockSwitchTransition}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                className={DOCK_ROW}
              >
                <div className={DOCK_ACTION_SLOT}>
                  <button
                    type="button"
                    onClick={() => setShowMeetingsDock(false)}
                    className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-lg p-2 transition-all touch-manipulation active:scale-95 sm:hover:scale-105"
                    aria-label="Show main dock"
                  >
                    <ArrowLeft className="h-6 w-6 sm:h-7 sm:w-7 text-foreground transition-colors" />
                  </button>
                </div>

                <div className={DOCK_ACTION_SLOT}>
                  <button
                    type="button"
                    disabled={refreshBusy}
                    onClick={() =>
                      window.dispatchEvent(
                        new CustomEvent(MEETINGS_DOCK_REFRESH)
                      )
                    }
                    className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-lg p-2 transition-all touch-manipulation active:scale-95 sm:hover:scale-105 disabled:opacity-40"
                    aria-label="Refresh meetings"
                  >
                    {meetingsDockMeta.listLoading ? (
                      <Loader2 className="h-6 w-6 sm:h-7 sm:w-7 animate-spin text-muted-foreground" />
                    ) : (
                      <RefreshCw className="h-6 w-6 sm:h-7 sm:w-7 text-foreground transition-colors" />
                    )}
                  </button>
                </div>

                <div className={DOCK_ACTION_SLOT}>
                  <button
                    type="button"
                    onClick={() =>
                      window.dispatchEvent(new CustomEvent(MEETINGS_DOCK_ADD))
                    }
                    className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-lg p-2 transition-all touch-manipulation active:scale-95 sm:hover:scale-105 bg-spirits-cyan/15"
                    aria-label="Request new meeting"
                  >
                    <Plus className="h-6 w-6 sm:h-7 sm:w-7 text-spirits-cyan transition-colors" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </MotionConfig>
    )
  }

  if (isNoticesPostPage) {
    const noticesPostBusy =
      noticesPostMeta.saving || noticesPostMeta.uploading

    return (
      <MotionConfig transition={transition}>
        <div ref={dockRowRef} className="relative w-full min-w-0 min-h-16 sm:min-h-20">
          <motion.div
            key="notices-post-actions"
            transition={dockSwitchTransition}
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={DOCK_ROW}
          >
            <div className={DOCK_ACTION_SLOT}>
              <button
                type="button"
                disabled={noticesPostMeta.saving}
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent(NOTICES_POST_DOCK_CANCEL)
                  )
                }
                className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-lg p-2 transition-all touch-manipulation active:scale-95 sm:hover:scale-105 disabled:opacity-40"
                aria-label="Cancel — leave without posting"
              >
                <X className="h-6 w-6 sm:h-7 sm:w-7 text-foreground transition-colors" />
              </button>
            </div>

            <div className={DOCK_ACTION_SLOT}>
              <button
                type="button"
                disabled={noticesPostBusy}
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent(NOTICES_POST_DOCK_SUBMIT)
                  )
                }
                className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-lg p-2 transition-all touch-manipulation active:scale-95 sm:hover:scale-105 bg-spirits-cyan/15 disabled:opacity-40"
                aria-label={
                  noticesPostMeta.editing
                    ? 'Save notice changes'
                    : 'Post notice'
                }
              >
                {noticesPostMeta.saving ? (
                  <Loader2 className="h-6 w-6 sm:h-7 sm:w-7 animate-spin text-spirits-cyan" />
                ) : (
                  <Check
                    className="h-6 w-6 sm:h-7 sm:w-7 text-spirits-yellow transition-colors"
                    strokeWidth={2.5}
                  />
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </MotionConfig>
    )
  }

  if (isModuleMakerPage) {
    const refreshBusy =
      moduleMakerMeta.listLoading || moduleMakerMeta.saving

    return (
      <MotionConfig transition={transition}>
        <div ref={dockRowRef} className="relative w-full min-w-0 min-h-16 sm:min-h-20">
          <AnimatePresence mode="wait" initial={false}>
            {!showModuleMakerDock ? (
              <motion.div
                key="module-maker-main"
                transition={dockSwitchTransition}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
              >
                {mainDockRow}
              </motion.div>
            ) : moduleMakerMeta.formOpen ? (
              <motion.div
                key="module-maker-form"
                transition={dockSwitchTransition}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                className={DOCK_ROW}
              >
                <div className={DOCK_ACTION_SLOT}>
                  <button
                    type="button"
                    disabled={moduleMakerMeta.saving}
                    onClick={() =>
                      window.dispatchEvent(
                        new CustomEvent(TRAINING_DOCK_CLOSE_FORM)
                      )
                    }
                    className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-lg p-2 transition-all touch-manipulation active:scale-95 sm:hover:scale-105 disabled:opacity-40"
                    aria-label="Cancel — discard changes"
                  >
                    <X className="h-6 w-6 sm:h-7 sm:w-7 text-foreground transition-colors" />
                  </button>
                </div>

                <div className={DOCK_ACTION_SLOT}>
                  <button
                    type="button"
                    disabled={moduleMakerMeta.saving}
                    onClick={() =>
                      window.dispatchEvent(
                        new CustomEvent(TRAINING_DOCK_SUBMIT_FORM)
                      )
                    }
                    className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-lg p-2 transition-all touch-manipulation active:scale-95 sm:hover:scale-105 bg-spirits-cyan/15 disabled:opacity-40"
                    aria-label={
                      moduleMakerMeta.editing
                        ? 'Save module changes'
                        : 'Publish new module'
                    }
                  >
                    {moduleMakerMeta.saving ? (
                      <Loader2 className="h-6 w-6 sm:h-7 sm:w-7 animate-spin text-spirits-cyan" />
                    ) : (
                      <Check
                        className="h-6 w-6 sm:h-7 sm:w-7 text-spirits-cyan transition-colors"
                        strokeWidth={2.5}
                      />
                    )}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="module-maker-dock"
                transition={dockSwitchTransition}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                className={DOCK_ROW}
              >
                <div className={DOCK_ACTION_SLOT}>
                  <button
                    type="button"
                    onClick={() => setShowModuleMakerDock(false)}
                    className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-lg p-2 transition-all touch-manipulation active:scale-95 sm:hover:scale-105"
                    aria-label="Show main dock"
                  >
                    <ArrowLeft className="h-6 w-6 sm:h-7 sm:w-7 text-foreground transition-colors" />
                  </button>
                </div>

                <div className={DOCK_ACTION_SLOT}>
                  <button
                    type="button"
                    disabled={refreshBusy}
                    onClick={() =>
                      window.dispatchEvent(
                        new CustomEvent(TRAINING_DOCK_REFRESH)
                      )
                    }
                    className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-lg p-2 transition-all touch-manipulation active:scale-95 sm:hover:scale-105 disabled:opacity-40"
                    aria-label="Refresh modules"
                  >
                    {moduleMakerMeta.listLoading ? (
                      <Loader2 className="h-6 w-6 sm:h-7 sm:w-7 animate-spin text-muted-foreground" />
                    ) : (
                      <RefreshCw className="h-6 w-6 sm:h-7 sm:w-7 text-foreground transition-colors" />
                    )}
                  </button>
                </div>

                <div className={DOCK_ACTION_SLOT}>
                  <button
                    type="button"
                    onClick={() =>
                      window.dispatchEvent(new CustomEvent(TRAINING_DOCK_ADD))
                    }
                    className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-lg p-2 transition-all touch-manipulation active:scale-95 sm:hover:scale-105 bg-spirits-cyan/15"
                    aria-label="New training module"
                  >
                    <Plus className="h-6 w-6 sm:h-7 sm:w-7 text-spirits-cyan transition-colors" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </MotionConfig>
    )
  }

  if (isManageStaffPage) {
    return (
      <MotionConfig transition={transition}>
        <div ref={dockRowRef} className="relative w-full min-w-0 min-h-16 sm:min-h-20">
          <AnimatePresence mode="wait" initial={false}>
            {showStaffDock ? (
              <motion.div
                key="staff-dock"
                transition={dockSwitchTransition}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                className={DOCK_ROW}
              >
                <div className={DOCK_ACTION_SLOT}>
                  <button
                    type="button"
                    onClick={() => {
                      if (staffDockMeta.formOpen) {
                        window.dispatchEvent(new CustomEvent(STAFF_DOCK_CLOSE_FORM))
                      } else {
                        setShowStaffDock(false)
                      }
                    }}
                    className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-lg p-2 transition-all touch-manipulation active:scale-95 sm:hover:scale-105"
                    aria-label={
                      staffDockMeta.formOpen ? 'Back to directory' : 'Show main dock'
                    }
                  >
                    <ArrowLeft className="h-6 w-6 sm:h-7 sm:w-7 text-foreground transition-colors" />
                  </button>
                </div>

                {staffDockMeta.canAdd && !staffDockMeta.formOpen && (
                  <div className={DOCK_ACTION_SLOT}>
                    <button
                      type="button"
                      onClick={() =>
                        window.dispatchEvent(new CustomEvent(STAFF_DOCK_ADD_ACCOUNT))
                      }
                      className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-lg p-2 transition-all touch-manipulation active:scale-95 sm:hover:scale-105 bg-spirits-cyan/15"
                      aria-label="Add account"
                    >
                      <Plus className="h-6 w-6 sm:h-7 sm:w-7 text-spirits-cyan transition-colors" />
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="staff-main-dock"
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

  return (
    <div ref={dockRowRef} className="relative w-full min-w-0 min-h-16 sm:min-h-20">
      {mainDockRow}
    </div>
  )
}
