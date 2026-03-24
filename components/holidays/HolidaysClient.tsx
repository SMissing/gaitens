'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { HolidayCalendar } from './HolidayCalendar'
import { HolidayDayManager } from './HolidayDayManager'
import { AddHolidayForm } from './AddHolidayForm'
import type { HolidayRequest, User, UserRole } from '@/types/database'
import { parseYyyyMmDdLocal, toYyyyMmDdLocal } from '@/lib/date-utils'
import {
  emitHolidaysDockSync,
  HOLIDAYS_ADD,
  HOLIDAYS_DAY_CANCEL,
  HOLIDAYS_DAY_CONFIRM,
  HOLIDAYS_DAY_NOTES_CHANGE,
  HOLIDAYS_DAY_SET_STATUS,
  HOLIDAYS_SET_VIEW,
  type HolidaysViewMode,
} from '@/lib/holidays-dock-bridge'

interface HolidaysClientProps {
  userRole: UserRole
}

interface ApprovedTeamHoliday extends HolidayRequest {
  users: User | User[] | null
}

function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export function HolidaysClient({ userRole }: HolidaysClientProps) {
  const [pageView, setPageView] = useState<HolidaysViewMode>('calendar')
  const [editingDate, setEditingDate] = useState<Date | null>(null)
  const [dayEditStatus, setDayEditStatus] = useState<'green' | 'yellow' | 'red'>('green')
  const [dayEditNotes, setDayEditNotes] = useState('')
  const [dayEditFetching, setDayEditFetching] = useState(false)
  const [dayEditSubmitting, setDayEditSubmitting] = useState(false)
  const [dayEditError, setDayEditError] = useState<string | null>(null)
  const [managingHolidaysDate, setManagingHolidaysDate] = useState<Date | null>(null)
  const [showAddHoliday, setShowAddHoliday] = useState(false)
  const [showRequestHoliday, setShowRequestHoliday] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const [myRequests, setMyRequests] = useState<HolidayRequest[]>([])
  const [requestsLoading, setRequestsLoading] = useState(false)
  const [requestsError, setRequestsError] = useState<string | null>(null)

  const [teamUpcoming, setTeamUpcoming] = useState<ApprovedTeamHoliday[]>([])
  const [teamListsLoading, setTeamListsLoading] = useState(false)

  const isAdmin = userRole === 'admin'
  const isManagerOrAdmin = userRole === 'manager' || userRole === 'admin'

  const today = useMemo(() => startOfDay(new Date()), [])

  const dockPhase = editingDate ? 'day_edit' : 'browse'

  const dayEditDateLabel = useMemo(() => {
    if (!editingDate) return ''
    return editingDate.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }, [editingDate])

  useEffect(() => {
    emitHolidaysDockSync({
      phase: dockPhase,
      view: pageView,
      dayEdit:
        editingDate
          ? {
              dateLabel: dayEditDateLabel,
              status: dayEditStatus,
              notes: dayEditNotes,
              fetching: dayEditFetching,
              submitting: dayEditSubmitting,
              error: dayEditError,
            }
          : undefined,
    })
  }, [
    dockPhase,
    pageView,
    editingDate,
    dayEditDateLabel,
    dayEditStatus,
    dayEditNotes,
    dayEditFetching,
    dayEditSubmitting,
    dayEditError,
  ])

  useEffect(() => {
    const onView = (e: Event) => {
      const v = (e as CustomEvent<{ view: HolidaysViewMode }>).detail?.view
      if (v) setPageView(v)
    }
    const onAdd = () => {
      if (userRole === 'admin') {
        setShowAddHoliday(true)
      } else {
        setShowRequestHoliday(true)
      }
    }
    const onCancel = () => {
      setEditingDate(null)
      setDayEditError(null)
    }
    const onSetStatus = (e: Event) => {
      const s = (e as CustomEvent<{ status: 'green' | 'yellow' | 'red' }>).detail?.status
      if (s) setDayEditStatus(s)
    }
    const onNotes = (e: Event) => {
      const n = (e as CustomEvent<{ notes: string }>).detail?.notes
      if (typeof n === 'string') setDayEditNotes(n)
    }

    window.addEventListener(HOLIDAYS_SET_VIEW, onView)
    window.addEventListener(HOLIDAYS_ADD, onAdd)
    window.addEventListener(HOLIDAYS_DAY_CANCEL, onCancel)
    window.addEventListener(HOLIDAYS_DAY_SET_STATUS, onSetStatus)
    window.addEventListener(HOLIDAYS_DAY_NOTES_CHANGE, onNotes)

    return () => {
      window.removeEventListener(HOLIDAYS_SET_VIEW, onView)
      window.removeEventListener(HOLIDAYS_ADD, onAdd)
      window.removeEventListener(HOLIDAYS_DAY_CANCEL, onCancel)
      window.removeEventListener(HOLIDAYS_DAY_SET_STATUS, onSetStatus)
      window.removeEventListener(HOLIDAYS_DAY_NOTES_CHANGE, onNotes)
    }
  }, [userRole])

  const submitDayEdit = useCallback(async () => {
    if (!editingDate || !isAdmin) return
    setDayEditSubmitting(true)
    setDayEditError(null)
    try {
      const dateStr = toYyyyMmDdLocal(editingDate)
      const response = await fetch(`/api/holidays/calendar/${dateStr}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: dayEditStatus,
          notes: dayEditNotes || null,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update calendar day')
      }
      setEditingDate(null)
      setDayEditError(null)
      setRefreshKey((k) => k + 1)
    } catch (err) {
      console.error(err)
      setDayEditError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setDayEditSubmitting(false)
    }
  }, [editingDate, isAdmin, dayEditStatus, dayEditNotes])

  useEffect(() => {
    const onConfirm = () => {
      void submitDayEdit()
    }
    window.addEventListener(HOLIDAYS_DAY_CONFIRM, onConfirm)
    return () => window.removeEventListener(HOLIDAYS_DAY_CONFIRM, onConfirm)
  }, [submitDayEdit])

  useEffect(() => {
    if (!editingDate || !isAdmin) {
      setDayEditFetching(false)
      return
    }
    setDayEditError(null)
    let cancelled = false
    ;(async () => {
      setDayEditFetching(true)
      try {
        const dateStr = toYyyyMmDdLocal(editingDate)
        const response = await fetch(`/api/holidays/calendar?startDate=${dateStr}&endDate=${dateStr}`)
        if (response.ok && !cancelled) {
          const data = await response.json()
          if (Array.isArray(data) && data.length > 0) {
            setDayEditStatus(data[0].status)
            setDayEditNotes(data[0].notes || '')
          } else if (!cancelled) {
            setDayEditStatus('green')
            setDayEditNotes('')
          }
        }
      } catch {
        if (!cancelled) {
          setDayEditStatus('green')
          setDayEditNotes('')
        }
      } finally {
        if (!cancelled) setDayEditFetching(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [editingDate, isAdmin])

  useEffect(() => {
    if (userRole === 'admin') return

    const fetchRequests = async () => {
      try {
        setRequestsLoading(true)
        setRequestsError(null)
        const res = await fetch('/api/holidays/requests', { cache: 'no-store' })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Failed to load your holiday requests')
        }
        const data: HolidayRequest[] = await res.json()
        setMyRequests(data || [])
      } catch (err) {
        setRequestsError(err instanceof Error ? err.message : 'Failed to load your holiday requests')
      } finally {
        setRequestsLoading(false)
      }
    }

    fetchRequests()
  }, [refreshKey, userRole])

  useEffect(() => {
    if (!isManagerOrAdmin || pageView !== 'upcoming_list') return

    let cancelled = false
    ;(async () => {
      setTeamListsLoading(true)
      try {
        const far = new Date()
        far.setFullYear(far.getFullYear() + 2)
        const farStr = toYyyyMmDdLocal(far)
        const todayStr = toYyyyMmDdLocal(today)

        const res = await fetch(
          `/api/holidays/approved?startDate=${todayStr}&endDate=${farStr}`,
          { cache: 'no-store' }
        )
        if (!res.ok) throw new Error('Failed to load holidays')
        const data: ApprovedTeamHoliday[] = await res.json()
        if (!cancelled) {
          setTeamUpcoming(data.filter((r) => parseYyyyMmDdLocal(r.endDate) >= today))
        }
      } catch (e) {
        console.error(e)
        if (!cancelled) setTeamUpcoming([])
      } finally {
        if (!cancelled) setTeamListsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isManagerOrAdmin, pageView, today])

  const { upcomingApproved, pastApproved } = useMemo(() => {
    const upcomingApproved = myRequests
      .filter((req) => {
        if (req.status !== 'approved') return false
        const end = parseYyyyMmDdLocal(req.endDate)
        end.setHours(0, 0, 0, 0)
        return end >= today
      })
      .sort((a, b) => parseYyyyMmDdLocal(a.startDate).getTime() - parseYyyyMmDdLocal(b.startDate).getTime())

    const pastApproved = myRequests
      .filter((req) => {
        if (req.status !== 'approved') return false
        return parseYyyyMmDdLocal(req.endDate) < today
      })
      .sort(
        (a, b) =>
          parseYyyyMmDdLocal(b.endDate).getTime() - parseYyyyMmDdLocal(a.endDate).getTime()
      )

    return { upcomingApproved, pastApproved }
  }, [myRequests, today])

  const countDays = (start: string, end: string) => {
    const startDate = parseYyyyMmDdLocal(start)
    const endDate = parseYyyyMmDdLocal(end)
    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(0, 0, 0, 0)
    const diff = endDate.getTime() - startDate.getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1
  }

  const handleDateClick = (date: Date) => {
    if (!isAdmin) return
    setEditingDate(date)
    setManagingHolidaysDate(null)
  }

  const formatDate = (dateStr: string) => {
    const date = parseYyyyMmDdLocal(dateStr)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const teamUserLabel = (req: ApprovedTeamHoliday) => {
    const u = req.users
    const list = Array.isArray(u) ? u : u ? [u] : []
    const names = list.map((x) => x?.name).filter(Boolean) as string[]
    return names[0] || 'Unknown'
  }

  const renderStaffListRow = (req: HolidayRequest, badge: 'approved' | 'pending') => (
    <div
      key={req.id}
      className="w-full rounded-xl border border-border/40 bg-black/15 p-3.5 text-left transition-colors hover:border-spirits-magenta/35 hover:bg-white/[0.03]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-base font-semibold tracking-tight text-foreground">
            {formatDate(req.startDate)}
            {req.startDate !== req.endDate ? ` – ${formatDate(req.endDate)}` : ''}
          </div>
          <div className="text-sm text-muted-foreground">
            {countDays(req.startDate, req.endDate)} day{countDays(req.startDate, req.endDate) !== 1 ? 's' : ''}
            {badge === 'pending' && (
              <>
                {' '}
                · Requested{' '}
                {new Date(req.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </>
            )}
          </div>
        </div>
        <div
          className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${
            badge === 'approved'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
              : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
          }`}
        >
          {badge === 'approved' ? 'Approved' : 'Pending'}
        </div>
      </div>
    </div>
  )

  const renderTeamListRow = (req: ApprovedTeamHoliday) => (
    <div
      key={req.id}
      className="w-full rounded-xl border border-border/40 bg-black/15 p-3.5 text-left"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-base font-semibold tracking-tight text-foreground">{teamUserLabel(req)}</div>
          <div className="text-sm text-muted-foreground">
            {formatDate(req.startDate)}
            {req.startDate !== req.endDate ? ` – ${formatDate(req.endDate)}` : ''}
          </div>
          {req.reason && <div className="text-xs italic text-muted-foreground">{req.reason}</div>}
        </div>
        <div className="rounded-lg border border-spirits-magenta/25 bg-spirits-magenta/10 px-2.5 py-1 text-xs font-semibold text-spirits-magenta">
          Approved
        </div>
      </div>
    </div>
  )

  const mainAreaClass =
    'fixed inset-x-0 z-0 flex flex-col overflow-hidden px-3 pt-2 pb-1 sm:px-5 lg:px-6 top-[calc(env(safe-area-inset-top,0px)+64px)] sm:top-[calc(env(safe-area-inset-top,0px)+80px)] lg:top-[calc(env(safe-area-inset-top,0px)+90px)] bottom-[calc(env(safe-area-inset-bottom,0px)+5.5rem)]'

  return (
    <>
      <div className={mainAreaClass}>
      {pageView === 'calendar' && (
        <div className="flex min-h-0 flex-1 flex-col">
          <HolidayCalendar
            key={refreshKey}
            pageFillHeight
            userRole={userRole === 'admin' ? 'admin' : userRole === 'manager' ? 'manager' : 'staff'}
            onDateClick={isAdmin ? handleDateClick : undefined}
            onHolidayClick={(date) => {
              if (!isManagerOrAdmin) return
              setManagingHolidaysDate(date)
              setEditingDate(null)
            }}
            hideBackdatesListToggle={isManagerOrAdmin}
            forcedListMode={false}
          />
        </div>
      )}

      {pageView === 'upcoming_list' && (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-2xl border border-border/50 bg-[#1e1e1e] p-5 sm:p-6">
          <h3 className="mb-4 border-b border-border/40 pb-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Upcoming holidays
          </h3>
          {!isManagerOrAdmin && requestsError && (
            <div className="mb-3 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-500">
              {requestsError}
            </div>
          )}
          {isManagerOrAdmin ? (
            teamListsLoading ? (
              <div className="py-10 text-center text-sm text-muted-foreground">Loading…</div>
            ) : teamUpcoming.length === 0 ? (
              <div className="rounded-xl border border-border/40 bg-black/20 py-10 text-center text-sm text-muted-foreground">
                No upcoming approved holidays
              </div>
            ) : (
              <div className="space-y-2">{teamUpcoming.map((r) => renderTeamListRow(r))}</div>
            )
          ) : requestsLoading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">Loading…</div>
          ) : upcomingApproved.length === 0 ? (
            <div className="rounded-xl border border-border/40 bg-black/20 py-10 text-center text-sm text-muted-foreground">
              No upcoming approved holidays
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingApproved.map((r) => renderStaffListRow(r, 'approved'))}
            </div>
          )}
        </div>
      )}

      {pageView === 'previous_list' && (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/50 bg-[#1e1e1e] p-4 sm:p-5">
          {isManagerOrAdmin ? (
            <HolidayCalendar
              key={`prev-${refreshKey}`}
              pageFillHeight
              userRole={userRole === 'admin' ? 'admin' : 'manager'}
              forcedListMode
              hideBackdatesListToggle
              onHolidayClick={(date) => {
                setManagingHolidaysDate(date)
                setEditingDate(null)
              }}
            />
          ) : (
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              <h3 className="mb-4 shrink-0 border-b border-border/40 pb-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Previous holidays
              </h3>
              {requestsError && (
                <div className="mb-3 shrink-0 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-500">
                  {requestsError}
                </div>
              )}
              {requestsLoading ? (
                <div className="py-10 text-center text-sm text-muted-foreground">Loading…</div>
              ) : pastApproved.length === 0 ? (
                <div className="rounded-xl border border-border/40 bg-black/20 py-10 text-center text-sm text-muted-foreground">
                  No past approved holidays
                </div>
              ) : (
                <div className="space-y-2">
                  {pastApproved.map((r) => renderStaffListRow(r, 'approved'))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      </div>

      {showAddHoliday && (
        <div
          className="fixed inset-0 z-[58] flex items-center justify-center bg-black/80 px-4 py-8"
          onClick={() => setShowAddHoliday(false)}
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <AddHolidayForm
              onSuccess={() => {
                setShowAddHoliday(false)
                setTimeout(() => setRefreshKey((k) => k + 1), 300)
              }}
              onClose={() => setShowAddHoliday(false)}
            />
          </div>
        </div>
      )}

      {showRequestHoliday && (
        <div
          className="fixed inset-0 z-[58] flex items-center justify-center bg-black/80 px-4 py-8"
          onClick={() => setShowRequestHoliday(false)}
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <AddHolidayForm
              mode="request"
              onSuccess={() => {
                setShowRequestHoliday(false)
                setTimeout(() => setRefreshKey((k) => k + 1), 300)
              }}
              onClose={() => setShowRequestHoliday(false)}
            />
          </div>
        </div>
      )}

      {managingHolidaysDate && (
        <div
          className="fixed inset-0 z-[58] flex items-center justify-center bg-black/80 px-4 py-8"
          onClick={() => setManagingHolidaysDate(null)}
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <HolidayDayManager
              key={`manager-${toYyyyMmDdLocal(managingHolidaysDate)}-${refreshKey}`}
              date={managingHolidaysDate}
              onUpdate={() => {
                setRefreshKey((k) => k + 1)
                setTimeout(() => setManagingHolidaysDate(null), 400)
              }}
              onClose={() => setManagingHolidaysDate(null)}
              canRemove={userRole === 'admin'}
              onEditAvailability={
                isAdmin
                  ? () => {
                      setEditingDate(managingHolidaysDate)
                      setManagingHolidaysDate(null)
                    }
                  : undefined
              }
            />
          </div>
        </div>
      )}

    </>
  )
}
