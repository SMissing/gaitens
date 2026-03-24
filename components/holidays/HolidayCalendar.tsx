'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { DayButtonProps } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { HolidayCalendarAvailability, HolidayRequest, User } from '@/types/database'
import { parseYyyyMmDdLocal, toYyyyMmDdLocal } from '@/lib/date-utils'
import { cn } from '@/lib/utils'

interface ApprovedHolidayRequest extends HolidayRequest {
  users: User | User[] | null
}

interface HolidayCalendarProps {
  userRole: 'staff' | 'manager' | 'admin'
  onDateClick?: (date: Date) => void
  onHolidayClick?: (date: Date) => void
  selectedStartDate?: Date | null
  selectedEndDate?: Date | null
  /** When true, manager/admin backdates list is only controlled from the page (dock), not this card. */
  hideBackdatesListToggle?: boolean
  /** When true (manager/admin only), always show the per-day approved list for the visible month. */
  forcedListMode?: boolean
  /** Stretch to fill a flex parent (e.g. holidays page main area below header). */
  pageFillHeight?: boolean
}

function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function sameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

type HolidayCalendarContextValue = {
  isManagerOrAdmin: boolean
  isAdmin: boolean
  approvedHolidays: Record<string, ApprovedHolidayRequest[]>
  /** Distinct people off per day (all roles — from off-counts API) */
  offCountsByDate: Record<string, number>
  today: Date
  getDayStatus: (date: Date) => 'green' | 'yellow' | 'red'
}

const HolidayCalendarContext = createContext<HolidayCalendarContextValue | null>(null)

function useHolidayCalendarContext() {
  const ctx = useContext(HolidayCalendarContext)
  if (!ctx) throw new Error('HolidayDayButton must be used within HolidayCalendar')
  return ctx
}

const MAX_DOTS_IN_CELL = 8

/** One entry per distinct person with approved time off on that day */
function uniquePeopleOffForRequests(requests: ApprovedHolidayRequest[]): { key: string; name: string }[] {
  const out: { key: string; name: string }[] = []
  const seen = new Set<string>()
  for (const req of requests) {
    const userData = Array.isArray(req.users) ? req.users[0] : req.users
    const user = userData as User | null
    const key = user?.id ?? `req-${req.id}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push({ key, name: user?.name || 'Unknown' })
  }
  return out
}

function HolidayDayButton({ day, modifiers, className, children, ...buttonProps }: DayButtonProps) {
  const ctx = useHolidayCalendarContext()
  const ref = useRef<HTMLButtonElement>(null)
  const date = day.date
  const dateStr = toYyyyMmDdLocal(date)
  const dayHolidays = ctx.approvedHolidays[dateStr] || []
  const offCountFromApi = ctx.offCountsByDate[dateStr] ?? 0
  const canOpenHolidayDetails = ctx.isManagerOrAdmin && dayHolidays.length > 0
  const peopleOff = canOpenHolidayDetails ? uniquePeopleOffForRequests(dayHolidays) : []
  const dotCount =
    ctx.isManagerOrAdmin && peopleOff.length > 0 ? peopleOff.length : offCountFromApi
  const showDots = dotCount > 0
  const namesTitle =
    ctx.isManagerOrAdmin && peopleOff.length > 0
      ? peopleOff.map((p) => p.name).join(', ')
      : offCountFromApi > 0
        ? `${offCountFromApi} ${offCountFromApi === 1 ? 'person' : 'people'} off`
        : ''

  useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        className,
        '!flex h-full min-h-[3.75rem] w-full flex-col items-stretch justify-between gap-0 py-1 sm:min-h-[4.5rem]',
        canOpenHolidayDetails && 'hover:ring-1 hover:ring-spirits-magenta/50',
        ctx.isAdmin && ctx.getDayStatus(date) === 'red' && 'hover:ring-1 hover:ring-red-500/45'
      )}
      title={namesTitle || undefined}
      {...buttonProps}
    >
      <div className="flex shrink-0 justify-center text-center leading-none">{children}</div>
      {showDots && (
        <div
          className="flex min-h-[18px] shrink-0 flex-wrap content-end justify-center gap-x-1 gap-y-1 px-0.5 pb-0.5"
          aria-label={`${dotCount} ${dotCount === 1 ? 'person' : 'people'} off`}
        >
          {Array.from(
            { length: Math.min(dotCount, MAX_DOTS_IN_CELL) },
            (_, i) => (
              <span
                key={i}
                className="box-border h-2.5 w-2.5 shrink-0 rounded-full bg-spirits-magenta ring-2 ring-white/30 sm:h-3 sm:w-3"
                aria-hidden
              />
            )
          )}
          {dotCount > MAX_DOTS_IN_CELL && (
            <span className="self-center text-[10px] font-semibold leading-none text-foreground/90">
              +{dotCount - MAX_DOTS_IN_CELL}
            </span>
          )}
        </div>
      )}
    </button>
  )
}

export function HolidayCalendar({
  userRole,
  onDateClick,
  onHolidayClick,
  selectedStartDate,
  selectedEndDate,
  hideBackdatesListToggle = false,
  forcedListMode = false,
  pageFillHeight = false,
}: HolidayCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => startOfDay(new Date()))
  const [listMode, setListMode] = useState(false)
  const [availability, setAvailability] = useState<Record<string, 'green' | 'yellow' | 'red'>>({})
  const [approvedHolidays, setApprovedHolidays] = useState<Record<string, ApprovedHolidayRequest[]>>({})
  const [offCountsByDate, setOffCountsByDate] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  const isManagerOrAdmin = userRole === 'manager' || userRole === 'admin'
  const isAdmin = userRole === 'admin'

  const today = useMemo(() => startOfDay(new Date()), [])

  useEffect(() => {
    setApprovedHolidays({})
    setOffCountsByDate({})
    setAvailability({})
    fetchCalendarData()
  }, [currentMonth, isManagerOrAdmin])

  const getDayStatus = useCallback(
    (date: Date): 'green' | 'yellow' | 'red' => {
      const dateStr = toYyyyMmDdLocal(date)
      return availability[dateStr] || 'green'
    },
    [availability]
  )

  const fetchCalendarData = async () => {
    try {
      setLoading(true)
      const year = currentMonth.getFullYear()
      const month = currentMonth.getMonth()
      const startDate = toYyyyMmDdLocal(new Date(year, month, 1))
      const endDate = toYyyyMmDdLocal(new Date(year, month + 1, 0))

      const fetchPromises: Promise<Response>[] = [
        fetch(`/api/holidays/calendar?startDate=${startDate}&endDate=${endDate}`, {
          cache: 'no-store',
        }),
        fetch(
          `/api/holidays/off-counts?startDate=${startDate}&endDate=${endDate}`,
          { cache: 'no-store' }
        ),
      ]

      if (isManagerOrAdmin) {
        fetchPromises.push(
          fetch(`/api/holidays/approved?startDate=${startDate}&endDate=${endDate}`, {
            cache: 'no-store',
          })
        )
      }

      const responses = await Promise.all(fetchPromises)
      const availabilityRes = responses[0]
      const offCountsRes = responses[1]
      const approvedRes = isManagerOrAdmin ? responses[2] : null

      if (availabilityRes.ok) {
        const data = await availabilityRes.json()
        const availabilityMap: Record<string, 'green' | 'yellow' | 'red'> = {}
        data.forEach((day: HolidayCalendarAvailability) => {
          availabilityMap[day.date] = day.status
        })
        setAvailability(availabilityMap)
      }

      if (offCountsRes.ok) {
        const payload = await offCountsRes.json()
        setOffCountsByDate(payload.counts && typeof payload.counts === 'object' ? payload.counts : {})
      } else {
        setOffCountsByDate({})
      }

      if (isManagerOrAdmin && approvedRes && approvedRes.ok) {
        const approvedData: ApprovedHolidayRequest[] = await approvedRes.json()
        const holidaysByDate: Record<string, ApprovedHolidayRequest[]> = {}

        approvedData.forEach((request) => {
          const start = parseYyyyMmDdLocal(request.startDate)
          const end = parseYyyyMmDdLocal(request.endDate)
          const currentDate = new Date(start)

          while (currentDate <= end) {
            const dateStr = toYyyyMmDdLocal(currentDate)
            if (!holidaysByDate[dateStr]) {
              holidaysByDate[dateStr] = []
            }
            const alreadyExists = holidaysByDate[dateStr].some((h) => h.id === request.id)
            if (!alreadyExists) {
              holidaysByDate[dateStr].push(request)
            }
            currentDate.setDate(currentDate.getDate() + 1)
          }
        })

        setApprovedHolidays(holidaysByDate)
      } else if (isManagerOrAdmin && approvedRes && !approvedRes.ok) {
        console.error('Failed to fetch approved holidays:', approvedRes.status)
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error)
    } finally {
      setLoading(false)
    }
  }

  const isBookingSelected = useCallback(
    (date: Date): boolean => {
      if (!selectedStartDate) return false
      if (!selectedEndDate) return sameCalendarDay(date, selectedStartDate)
      return sameCalendarDay(date, selectedStartDate) || sameCalendarDay(date, selectedEndDate)
    },
    [selectedStartDate, selectedEndDate]
  )

  const isBookingRangeFill = useCallback(
    (date: Date): boolean => {
      if (!selectedStartDate || !selectedEndDate) return false
      const t = startOfDay(date).getTime()
      const a = startOfDay(selectedStartDate).getTime()
      const b = startOfDay(selectedEndDate).getTime()
      return t > a && t < b
    },
    [selectedStartDate, selectedEndDate]
  )

  const handleDateClick = useCallback(
    (date: Date) => {
      const status = getDayStatus(date)
      if (!isAdmin && status === 'red') return
      onDateClick?.(date)
    },
    [getDayStatus, isAdmin, onDateClick]
  )

  const holidayDateKeys = Object.keys(approvedHolidays).sort()

  const ctxValue = useMemo<HolidayCalendarContextValue>(
    () => ({
      isManagerOrAdmin,
      isAdmin,
      approvedHolidays,
      offCountsByDate,
      today,
      getDayStatus,
    }),
    [isManagerOrAdmin, isAdmin, approvedHolidays, offCountsByDate, today, getDayStatus]
  )

  const modifiers = useMemo(
    () => ({
      bookingSelected: (d: Date) => isBookingSelected(d),
      bookingRangeFill: (d: Date) => isBookingRangeFill(d),
      availGreen: (d: Date) =>
        getDayStatus(d) === 'green' && !isBookingSelected(d) && !isBookingRangeFill(d),
      availYellow: (d: Date) =>
        getDayStatus(d) === 'yellow' && !isBookingSelected(d) && !isBookingRangeFill(d),
      availRed: (d: Date) =>
        getDayStatus(d) === 'red' && !isBookingSelected(d) && !isBookingRangeFill(d),
      pastDay: (d: Date) => startOfDay(d) < today,
    }),
    [getDayStatus, isBookingSelected, isBookingRangeFill, today]
  )

  const modifiersClassNames = useMemo(
    () => ({
      bookingSelected:
        '[&_button]:rounded-2xl [&_button]:border [&_button]:border-spirits-cyan/80 [&_button]:bg-spirits-cyan/45 [&_button]:shadow-[0_0_0_1px_rgba(34,211,238,0.12)]',
      bookingRangeFill: '[&_button]:rounded-2xl [&_button]:border-spirits-cyan/25 [&_button]:bg-spirits-cyan/20',
      availGreen:
        '[&_button]:rounded-2xl [&_button]:border-green-500/25 [&_button]:bg-green-500/25 [&_button]:hover:border-green-500/40 [&_button]:hover:bg-green-500/35',
      availYellow:
        '[&_button]:rounded-2xl [&_button]:border-yellow-500/30 [&_button]:bg-yellow-500/35 [&_button]:hover:border-yellow-500/45 [&_button]:hover:bg-yellow-500/45',
      availRed: isAdmin
        ? '[&_button]:rounded-2xl [&_button]:border-red-500/30 [&_button]:bg-red-500/35 [&_button]:hover:border-red-500/45 [&_button]:hover:bg-red-500/45'
        : '[&_button]:rounded-2xl [&_button]:border-red-500/25 [&_button]:bg-red-500/30 [&_button]:opacity-55 [&_button]:hover:bg-red-500/40 [&_button]:cursor-not-allowed',
      pastDay: '[&_button]:opacity-40',
    }),
    [isAdmin]
  )

  const disabledMatcher = useCallback(
    (date: Date) => {
      const dateStr = toYyyyMmDdLocal(date)
      const dayHolidays = approvedHolidays[dateStr] || []
      const canOpenHolidayDetails = isManagerOrAdmin && dayHolidays.length > 0
      const isPast = startOfDay(date) < today
      if (canOpenHolidayDetails) return false
      if (isPast) return true
      if (!isAdmin && getDayStatus(date) === 'red') return true
      return false
    },
    [approvedHolidays, isManagerOrAdmin, isAdmin, getDayStatus, today]
  )

  const disabledWhileLoading = useCallback(
    (date: Date) => loading || disabledMatcher(date),
    [loading, disabledMatcher]
  )

  const onDayClick = useCallback(
    (date: Date) => {
      const dateStr = toYyyyMmDdLocal(date)
      const dayHolidays = approvedHolidays[dateStr] || []
      const canOpenHolidayDetails = isManagerOrAdmin && dayHolidays.length > 0
      if (canOpenHolidayDetails) {
        onHolidayClick?.(date)
      } else {
        handleDateClick(date)
      }
    },
    [approvedHolidays, isManagerOrAdmin, onHolidayClick, handleDateClick]
  )

  const showManagerList = isManagerOrAdmin && (listMode || forcedListMode)

  return (
    <div
      className={cn(
        'rounded-2xl border border-border/50 bg-[#1e1e1e] p-5 sm:p-6',
        pageFillHeight && 'flex h-full min-h-0 flex-col overflow-hidden p-4 sm:p-5'
      )}
    >
      {showManagerList ? (
        loading ? (
          <div
            className={cn(
              'py-10 text-center text-sm text-muted-foreground',
              pageFillHeight && 'flex flex-1 items-center justify-center py-0'
            )}
          >
            Loading…
          </div>
        ) : (
        <div className={cn('space-y-4', pageFillHeight && 'min-h-0 flex-1 overflow-y-auto')}>
          <div className="flex flex-col gap-2 border-b border-border/40 pb-3 sm:flex-row sm:items-center sm:justify-between">
            {forcedListMode ? (
              <div className="flex w-full items-center justify-between gap-2 sm:justify-center sm:gap-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 shrink-0 rounded-xl p-0"
                  onClick={() =>
                    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
                  }
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="min-w-0 flex-1 text-center">
                  <div className="text-sm font-semibold tracking-tight text-foreground">
                    {currentMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                  </div>
                  <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    Approved days
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 shrink-0 rounded-xl p-0"
                  onClick={() =>
                    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
                  }
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Backdates
                </h3>
                <div className="flex justify-end sm:ml-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setListMode(false)}
                    className="h-8 rounded-xl px-3 text-xs hover:bg-white/[0.06]"
                  >
                    Show calendar
                  </Button>
                </div>
              </>
            )}
          </div>

          {holidayDateKeys.length === 0 ? (
            <div className="rounded-xl border border-border/40 bg-black/20 py-10 text-center text-sm text-muted-foreground">
              No approved holidays in this month
            </div>
          ) : (
            <div className="space-y-2">
              {holidayDateKeys.map((dateStr) => {
                const dayHolidays = approvedHolidays[dateStr] || []
                const dateObj = parseYyyyMmDdLocal(dateStr)
                const isPast = dateObj < today
                const peopleOff = uniquePeopleOffForRequests(dayHolidays)
                const namesTitle = peopleOff.map((p) => p.name).join(', ')
                return (
                  <button
                    key={dateStr}
                    type="button"
                    title={namesTitle || undefined}
                    className="w-full rounded-xl border border-border/40 bg-black/15 p-3.5 text-left transition-colors hover:border-spirits-magenta/35 hover:bg-white/[0.03]"
                    onClick={() => onHolidayClick?.(dateObj)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-2">
                        <div className="text-base font-semibold tracking-tight text-foreground">
                          {dateObj.toLocaleDateString('en-GB', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'long',
                          })}
                        </div>
                        <div
                          className="flex flex-wrap items-center gap-1.5"
                          aria-label={`${peopleOff.length} ${peopleOff.length === 1 ? 'person' : 'people'} off`}
                        >
                          {peopleOff.slice(0, MAX_DOTS_IN_CELL).map((p) => (
                            <span
                              key={p.key}
                              className="box-border h-2.5 w-2.5 shrink-0 rounded-full bg-spirits-magenta ring-2 ring-white/30 sm:h-3 sm:w-3"
                              aria-hidden
                            />
                          ))}
                          {peopleOff.length > MAX_DOTS_IN_CELL && (
                            <span className="text-xs text-muted-foreground">
                              +{peopleOff.length - MAX_DOTS_IN_CELL}
                            </span>
                          )}
                        </div>
                        {isPast && (
                          <div className="text-[11px] text-muted-foreground/90">Past day (view)</div>
                        )}
                      </div>
                      <div className="shrink-0 rounded-lg border border-spirits-magenta/25 bg-spirits-magenta/10 px-2.5 py-1 text-xs font-semibold text-spirits-magenta">
                        {peopleOff.length} off
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
        )
      ) : (
        <div
          className={cn(
            'relative',
            pageFillHeight ? 'flex min-h-0 flex-1 flex-col' : 'min-h-[320px]'
          )}
        >
          <HolidayCalendarContext.Provider value={ctxValue}>
            <Calendar
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              showOutsideDays={false}
              onDayClick={onDayClick}
              disabled={disabledWhileLoading}
              modifiers={modifiers}
              modifiersClassNames={modifiersClassNames}
              components={{ DayButton: HolidayDayButton }}
              className={cn('border-0 p-0', pageFillHeight && 'min-h-0 flex-1')}
              classNames={{
                root: cn('w-full', pageFillHeight && 'min-h-0 flex flex-1 flex-col'),
                months: cn(
                  pageFillHeight && 'min-h-0 flex-1 flex-col sm:!flex-col'
                ),
                month: cn(pageFillHeight && 'flex min-h-0 flex-1 flex-col'),
                month_grid: cn(pageFillHeight && 'min-h-0 flex-1'),
                caption_label: 'text-lg font-semibold tracking-tight sm:text-xl',
              }}
            />
          </HolidayCalendarContext.Provider>
          {loading && (
            <div className="pointer-events-none absolute inset-x-0 bottom-2 top-14 flex items-center justify-center rounded-xl bg-[#1e1e1e]/88 backdrop-blur-[2px]">
              <span className="text-sm font-medium text-muted-foreground">Loading…</span>
            </div>
          )}
        </div>
      )}

      {isManagerOrAdmin && (
        <div
          className={cn(
            'mt-6 flex flex-col gap-4 border-t border-border/40 pt-5',
            pageFillHeight && 'mt-3 shrink-0 pt-3'
          )}
        >
          {!hideBackdatesListToggle && (
            <div className="flex justify-end">
              {!listMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setListMode(true)}
                  className="h-9 rounded-xl border-border/50 bg-black/20 px-4 text-xs font-medium hover:bg-white/[0.05]"
                >
                  Backdates list
                </Button>
              )}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
            <div className="flex items-center gap-2 rounded-full border border-border/40 bg-black/15 px-3 py-1.5">
              <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-green-500/80 ring-2 ring-green-500/25" />
              <span className="text-xs text-muted-foreground">Available</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border/40 bg-black/15 px-3 py-1.5">
              <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-yellow-500/80 ring-2 ring-yellow-500/25" />
              <span className="text-xs text-muted-foreground">Limited</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border/40 bg-black/15 px-3 py-1.5">
              <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-500/75 ring-2 ring-red-500/25" />
              <span className="text-xs text-muted-foreground">Unavailable</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
