'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import type { DayButtonProps } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Clock, Settings, X } from 'lucide-react'
import { toYyyyMmDdLocal } from '@/lib/date-utils'
import { cn } from '@/lib/utils'
import {
  MANAGEMENT_CAL_DOCK_ADD,
  MANAGEMENT_CAL_DOCK_CLOSE_ADD,
  MANAGEMENT_CAL_DOCK_CLOSE_DAY,
  MANAGEMENT_CAL_DOCK_CLOSE_EDIT,
  MANAGEMENT_CAL_DOCK_REFRESH,
  MANAGEMENT_CAL_DOCK_STATE,
} from '@/lib/management-calendar-dock-bridge'

type ManagementEventType = 'management_meeting' | 'pubwatch' | 'disciplinary' | 'custom'
type RecurrenceType = 'none' | 'weekly'

type Occurrence = {
  occurrenceId: string
  eventId: string
  title: string
  eventType: ManagementEventType
  description: string | null
  site: string | null
  date: string // YYYY-MM-DD
  startTime: string | null
  endTime: string | null
}

const eventTypeLabel: Record<ManagementEventType, string> = {
  management_meeting: 'Management meeting',
  pubwatch: 'Pubwatch',
  disciplinary: 'Disciplinary',
  custom: 'Custom',
}

function getEventBadgeClass(eventType: ManagementEventType): string {
  switch (eventType) {
    case 'management_meeting':
      return 'bg-spirits-magenta/20 text-spirits-magenta border-spirits-magenta/30'
    case 'pubwatch':
      return 'bg-spirits-cyan/20 text-spirits-cyan border-spirits-cyan/30'
    case 'disciplinary':
      return 'bg-red-500/20 text-red-500 border-red-500/30'
    case 'custom':
    default:
      return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
  }
}

function getEventDotClass(eventType: ManagementEventType): string {
  switch (eventType) {
    case 'management_meeting':
      return 'bg-spirits-magenta shadow-sm shadow-black/25'
    case 'pubwatch':
      return 'bg-spirits-cyan shadow-sm shadow-black/25'
    case 'disciplinary':
      return 'bg-red-500 shadow-sm shadow-black/25'
    case 'custom':
    default:
      return 'bg-yellow-400 shadow-sm shadow-black/25'
  }
}

const MAX_EVENT_DOTS_IN_CELL = 8

function formatTime(time: string | null): string | null {
  if (!time) return null
  const [hh, mm] = time.split(':')
  const h = Number(hh)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const display = (h % 12) || 12
  return `${display}:${mm} ${ampm}`
}

type ManagementCalendarContextValue = {
  occurrencesByDate: Record<string, Occurrence[]>
  today: Date
}

const ManagementCalendarContext = createContext<ManagementCalendarContextValue | null>(null)

function useManagementCalendarContext() {
  const ctx = useContext(ManagementCalendarContext)
  if (!ctx) throw new Error('ManagementDayButton must be used within ManagementCalendar')
  return ctx
}

/** Pink inner glow on days with events — inset shadow stays inside the cell. */
const MANAGEMENT_DAY_EVENT_GLOW: CSSProperties = {
  boxShadow:
    'inset 0 0 18px 2px rgba(255, 0, 255, 0.42), inset 0 0 36px 6px rgba(255, 0, 255, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
}

function ManagementDayButton({
  day,
  modifiers,
  className,
  children,
  style,
  ...buttonProps
}: DayButtonProps) {
  const ctx = useManagementCalendarContext()
  const ref = useRef<HTMLButtonElement>(null)
  const dateStr = toYyyyMmDdLocal(day.date)
  const dayEvents = ctx.occurrencesByDate[dateStr] || []
  const hasEvents = dayEvents.length > 0
  const titlesSummary =
    hasEvents
      ? dayEvents.map((ev) => ev.title).join(' · ')
      : undefined

  const mergedStyle: CSSProperties | undefined = hasEvents
    ? { ...(style as CSSProperties | undefined), ...MANAGEMENT_DAY_EVENT_GLOW }
    : (style as CSSProperties | undefined)

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
        hasEvents &&
          'border-spirits-magenta/70 bg-spirits-magenta/[0.14] transition-[box-shadow,background-color,border-color] duration-200 hover:border-spirits-magenta hover:bg-spirits-magenta/[0.2]'
      )}
      style={mergedStyle}
      title={titlesSummary}
      {...buttonProps}
    >
      <div className="flex w-full shrink-0 justify-center text-center">
        <div className="text-xs font-semibold text-foreground leading-none">{children}</div>
      </div>

      {hasEvents && (
        <div
          className="flex min-h-[18px] shrink-0 flex-wrap content-end justify-center gap-x-1 gap-y-1 px-0.5 pb-0.5"
          aria-label={`${dayEvents.length} ${dayEvents.length === 1 ? 'event' : 'events'}`}
        >
          {dayEvents.slice(0, MAX_EVENT_DOTS_IN_CELL).map((ev) => (
            <span
              key={`${dateStr}-${ev.occurrenceId}`}
              className={cn(
                'box-border h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white/25 sm:h-3 sm:w-3',
                getEventDotClass(ev.eventType)
              )}
              aria-hidden
            />
          ))}
          {dayEvents.length > MAX_EVENT_DOTS_IN_CELL && (
            <span className="self-center text-[10px] font-semibold leading-none text-foreground/90">
              +{dayEvents.length - MAX_EVENT_DOTS_IN_CELL}
            </span>
          )}
        </div>
      )}
    </button>
  )
}

export function ManagementCalendar({ isAdmin = false }: { isAdmin?: boolean } = {}) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [occurrences, setOccurrences] = useState<Occurrence[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addSubmitting, setAddSubmitting] = useState(false)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [editSubmitting, setEditSubmitting] = useState(false)

  const startDate = useMemo(() => {
    return toYyyyMmDdLocal(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1))
  }, [currentMonth])

  const endDate = useMemo(() => {
    return toYyyyMmDdLocal(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0))
  }, [currentMonth])

  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        setLoading(true)
        const res = await fetch(`/api/management-calendar/events?startDate=${startDate}&endDate=${endDate}`, {
          cache: 'no-store',
        })
        const data = await res.json()
        if (!cancelled) setOccurrences(data.occurrences || [])
      } catch (e) {
        console.error('Failed to fetch management calendar events:', e)
        if (!cancelled) setOccurrences([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [startDate, endDate, refreshKey])

  const occurrencesByDate = useMemo(() => {
    const map: Record<string, Occurrence[]> = {}
    for (const occ of occurrences) {
      if (!map[occ.date]) map[occ.date] = []
      map[occ.date].push(occ)
    }
    // Stable ordering: time first, then title
    Object.keys(map).forEach((k) => {
      map[k].sort((a, b) => {
        if (a.startTime && b.startTime && a.startTime !== b.startTime) return a.startTime.localeCompare(b.startTime)
        return a.title.localeCompare(b.title)
      })
    })
    return map
  }, [occurrences])

  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const managementCtx = useMemo<ManagementCalendarContextValue>(
    () => ({ occurrencesByDate, today }),
    [occurrencesByDate, today]
  )

  const modifiers = useMemo(
    () => ({
      noEvents: (d: Date) => (occurrencesByDate[toYyyyMmDdLocal(d)] || []).length === 0,
    }),
    [occurrencesByDate]
  )

  const modifiersClassNames = useMemo(
    () => ({
      noEvents:
        '[&_button]:rounded-2xl [&_button]:border [&_button]:border-border/30 [&_button]:bg-black/10 [&_button]:hover:border-border/45 [&_button]:hover:bg-white/[0.04]',
    }),
    []
  )

  const refresh = () => {
    setRefreshKey((k) => k + 1)
  }

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent(MANAGEMENT_CAL_DOCK_STATE, {
        detail: {
          addModalOpen: showAddModal,
          dayPanelOpen: selectedDate != null,
          editModalOpen: editingEventId != null,
          listLoading: loading,
          saving: addSubmitting || editSubmitting,
        },
      })
    )
  }, [showAddModal, selectedDate, editingEventId, loading, addSubmitting, editSubmitting])

  useEffect(() => {
    const onAdd = () => {
      setSelectedDate(null)
      setShowAddModal(true)
    }
    const onRefresh = () => refresh()
    const onCloseAdd = () => setShowAddModal(false)
    const onCloseDay = () => {
      setSelectedDate(null)
      setEditingEventId(null)
    }
    const onCloseEdit = () => setEditingEventId(null)

    window.addEventListener(MANAGEMENT_CAL_DOCK_ADD, onAdd)
    window.addEventListener(MANAGEMENT_CAL_DOCK_REFRESH, onRefresh)
    window.addEventListener(MANAGEMENT_CAL_DOCK_CLOSE_ADD, onCloseAdd)
    window.addEventListener(MANAGEMENT_CAL_DOCK_CLOSE_DAY, onCloseDay)
    window.addEventListener(MANAGEMENT_CAL_DOCK_CLOSE_EDIT, onCloseEdit)

    return () => {
      window.removeEventListener(MANAGEMENT_CAL_DOCK_ADD, onAdd)
      window.removeEventListener(MANAGEMENT_CAL_DOCK_REFRESH, onRefresh)
      window.removeEventListener(MANAGEMENT_CAL_DOCK_CLOSE_ADD, onCloseAdd)
      window.removeEventListener(MANAGEMENT_CAL_DOCK_CLOSE_DAY, onCloseDay)
      window.removeEventListener(MANAGEMENT_CAL_DOCK_CLOSE_EDIT, onCloseEdit)
    }
  }, [])

  return (
    <div className="space-y-4">
      <Card className="overflow-visible rounded-2xl border border-border/50 bg-[#1e1e1e] p-5 sm:p-6">
        <CardContent className="relative min-h-[320px] overflow-visible p-0">
          <ManagementCalendarContext.Provider value={managementCtx}>
            <Calendar
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              showOutsideDays={false}
              disabled={loading ? () => true : undefined}
              onDayClick={(date) => {
                const ds = toYyyyMmDdLocal(date)
                if ((occurrencesByDate[ds] || []).length > 0) setSelectedDate(date)
              }}
              modifiers={modifiers}
              modifiersClassNames={modifiersClassNames}
              components={{ DayButton: ManagementDayButton }}
              className={cn('border-0 p-0', loading && 'opacity-40')}
              classNames={{
                root: 'w-full',
                month_grid: '[&_td.rdp-day]:overflow-visible',
                caption_label: 'text-lg font-semibold tracking-tight sm:text-xl',
                today:
                  '[&_button]:ring-1 [&_button]:ring-spirits-magenta/80 [&_button]:ring-offset-1 [&_button]:ring-offset-background',
              }}
            />
          </ManagementCalendarContext.Provider>
          {loading && (
            <div className="pointer-events-none absolute inset-x-0 bottom-2 top-14 flex items-center justify-center rounded-xl bg-[#1e1e1e]/88 backdrop-blur-[2px]">
              <span className="text-sm font-medium text-muted-foreground">Loading…</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Day details modal */}
      {selectedDate && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center px-4" onClick={() => setSelectedDate(null)}>
          <div
            className="bg-[#1e1e1e] rounded-2xl border border-border/50 max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/50 p-4">
              <div>
                <div className="text-lg font-semibold tracking-tight text-foreground">
                  {selectedDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div className="text-xs text-muted-foreground">{(occurrencesByDate[toYyyyMmDdLocal(selectedDate)] || []).length} events</div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedDate(null)} className="h-9 w-9 rounded-xl hover:bg-white/[0.06]">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3 overflow-y-auto p-4">
              {(occurrencesByDate[toYyyyMmDdLocal(selectedDate)] || []).map((ev) => (
                <div key={ev.occurrenceId} className="rounded-xl border border-border/40 bg-black/20 p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="font-semibold text-foreground">{ev.title}</div>
                      <div className="text-xs text-muted-foreground">{eventTypeLabel[ev.eventType]}</div>
                      {ev.description && <div className="text-sm text-muted-foreground whitespace-pre-wrap">{ev.description}</div>}
                      {ev.site && <div className="text-xs text-muted-foreground">Site: {ev.site}</div>}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <div className={`rounded-lg border px-2 py-1 text-xs ${getEventBadgeClass(ev.eventType)}`}>
                        {formatTime(ev.startTime) ? (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(ev.startTime)}
                          </div>
                        ) : (
                          'No time'
                        )}
                      </div>
                      {isAdmin && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
                          aria-label="Edit or delete event"
                          onClick={() => setEditingEventId(ev.eventId)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add event modal */}
      {showAddModal && (
        <AddEventModal
          onClose={() => setShowAddModal(false)}
          onSubmittingChange={setAddSubmitting}
          onCreated={async () => {
            setShowAddModal(false)
            refresh()
          }}
        />
      )}

      {editingEventId && (
        <EditManagementEventModal
          eventId={editingEventId}
          onClose={() => setEditingEventId(null)}
          onSubmittingChange={setEditSubmitting}
          onSaved={async () => {
            setEditingEventId(null)
            refresh()
          }}
        />
      )}
    </div>
  )
}

function AddEventModal({
  onClose,
  onCreated,
  onSubmittingChange,
}: {
  onClose: () => void
  onCreated: () => void | Promise<void>
  onSubmittingChange?: (submitting: boolean) => void
}) {
  const [title, setTitle] = useState('')
  const [eventType, setEventType] = useState<ManagementEventType>('management_meeting')
  const [description, setDescription] = useState('')
  const [site, setSite] = useState('')

  const todayStr = useMemo(() => toYyyyMmDdLocal(new Date()), [])

  const [startDate, setStartDate] = useState(todayStr)
  const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')

  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('none')
  const [recurrenceWeekday, setRecurrenceWeekday] = useState<number>(3) // Wed default
  const [recurrenceInterval, setRecurrenceInterval] = useState<number>(1)
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<string>('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const weekdayOptions = [
    { value: 0, label: 'Sun' },
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
  ]

  return (
    <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center px-4" onClick={onClose}>
      <div
        className="bg-[#1e1e1e] rounded-2xl border border-border/50 max-w-2xl w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="space-y-1">
            <div className="text-lg font-bold text-foreground">Add management event</div>
            <div className="text-xs text-muted-foreground">Manual add + weekly recurrence (MVP)</div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[70vh]">
          {error && <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded p-2">{error}</div>}

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Event type *</Label>
              <Select
                id="type"
                options={[
                  { value: 'management_meeting', label: 'Management meeting' },
                  { value: 'pubwatch', label: 'Pubwatch' },
                  { value: 'disciplinary', label: 'Disciplinary' },
                  { value: 'custom', label: 'Custom' },
                ]}
                value={eventType}
                onChange={(v) => setEventType(v as ManagementEventType)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="site">Site (optional)</Label>
              <Input id="site" value={site} onChange={(e) => setSite(e.target.value)} placeholder="e.g., Spirits" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start date *</Label>
              <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Start time (optional)</Label>
              <Input id="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="endDate">End date (optional)</Label>
              <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End time (optional)</Label>
              <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recurrenceType">Recurrence</Label>
            <Select
              id="recurrenceType"
              options={[
                { value: 'none', label: 'No recurrence' },
                { value: 'weekly', label: 'Repeat weekly' },
              ]}
              value={recurrenceType}
              onChange={(v) => setRecurrenceType(v as RecurrenceType)}
            />
          </div>

          {recurrenceType === 'weekly' && (
            <div className="space-y-4 border-t border-border/50 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weekday">Repeat on *</Label>
                  <Select
                    id="weekday"
                    options={weekdayOptions.map((o) => ({ value: String(o.value), label: o.label }))}
                    value={String(recurrenceWeekday)}
                    onChange={(v) => setRecurrenceWeekday(Number(v))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interval">Interval in weeks *</Label>
                  <Input
                    id="interval"
                    type="number"
                    min={1}
                    value={recurrenceInterval}
                    onChange={(e) => setRecurrenceInterval(Number(e.target.value || 1))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recurEnd">Repeat until (optional)</Label>
                <Input
                  id="recurEnd"
                  type="date"
                  value={recurrenceEndDate}
                  onChange={(e) => setRecurrenceEndDate(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Extra details" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button
              onClick={async () => {
                try {
                  setSubmitting(true)
                  onSubmittingChange?.(true)
                  setError(null)

                  if (!title.trim()) {
                    setError('Title is required')
                    return
                  }
                  if (!startDate) {
                    setError('Start date is required')
                    return
                  }

                  const payload: Record<string, unknown> = {
                    title: title.trim(),
                    eventType,
                    description: description.trim() || null,
                    site: site.trim() || null,
                    startDate,
                    endDate: endDate || null,
                    startTime: startTime || null,
                    endTime: endTime || null,
                    visible: true,
                    recurrence:
                      recurrenceType === 'weekly'
                        ? {
                            recurrenceType: 'weekly',
                            recurrenceWeekday,
                            recurrenceInterval: Math.max(1, recurrenceInterval || 1),
                            recurrenceEndDate: recurrenceEndDate || null,
                          }
                        : { recurrenceType: 'none' },
                  }

                  const res = await fetch('/api/management-calendar/events', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                  })
                  const data = await res.json()
                  if (!res.ok) {
                    throw new Error(data.error || 'Failed to create event')
                  }

                  await onCreated()
                } catch (e) {
                  setError(e instanceof Error ? e.message : 'Failed to create event')
                } finally {
                  setSubmitting(false)
                  onSubmittingChange?.(false)
                }
              }}
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create event'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function EditManagementEventModal({
  eventId,
  onClose,
  onSaved,
  onSubmittingChange,
}: {
  eventId: string
  onClose: () => void
  onSaved: () => void | Promise<void>
  onSubmittingChange?: (submitting: boolean) => void
}) {
  const [title, setTitle] = useState('')
  const [eventType, setEventType] = useState<ManagementEventType>('management_meeting')
  const [description, setDescription] = useState('')
  const [site, setSite] = useState('')

  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')

  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('none')
  const [recurrenceWeekday, setRecurrenceWeekday] = useState(3)
  const [recurrenceInterval, setRecurrenceInterval] = useState(1)
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('')

  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [visibleFlag, setVisibleFlag] = useState(true)

  const weekdayOptions = [
    { value: 0, label: 'Sun' },
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
  ]

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoadState('loading')
      setLoadError(null)
      try {
        const res = await fetch(`/api/management-calendar/events/${eventId}`, { cache: 'no-store' })
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || 'Failed to load event')
        }
        const ev = data.event as {
          title: string
          eventType: ManagementEventType
          description: string | null
          site: string | null
          startDate: string
          endDate: string | null
          startTime: string | null
          endTime: string | null
          visible: boolean
          recurrence:
            | { recurrenceType: 'none' }
            | {
                recurrenceType: 'weekly'
                recurrenceWeekday: number
                recurrenceInterval: number
                recurrenceEndDate: string | null
              }
        }
        if (cancelled) return
        setVisibleFlag(ev.visible)
        setTitle(ev.title)
        setEventType(ev.eventType)
        setDescription(ev.description ?? '')
        setSite(ev.site ?? '')
        setStartDate(ev.startDate)
        setStartTime(ev.startTime ?? '')
        setEndDate(ev.endDate ?? '')
        setEndTime(ev.endTime ?? '')
        if (ev.recurrence.recurrenceType === 'weekly') {
          setRecurrenceType('weekly')
          setRecurrenceWeekday(ev.recurrence.recurrenceWeekday)
          setRecurrenceInterval(Math.max(1, ev.recurrence.recurrenceInterval || 1))
          setRecurrenceEndDate(ev.recurrence.recurrenceEndDate ?? '')
        } else {
          setRecurrenceType('none')
          setRecurrenceWeekday(3)
          setRecurrenceInterval(1)
          setRecurrenceEndDate('')
        }
        setLoadState('ready')
      } catch (e) {
        if (!cancelled) {
          setLoadState('error')
          setLoadError(e instanceof Error ? e.message : 'Failed to load event')
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [eventId])

  const buildPayload = () => ({
    title: title.trim(),
    eventType,
    description: description.trim() || null,
    site: site.trim() || null,
    startDate,
    endDate: endDate || null,
    startTime: startTime || null,
    endTime: endTime || null,
    visible: visibleFlag,
    recurrence:
      recurrenceType === 'weekly'
        ? {
            recurrenceType: 'weekly' as const,
            recurrenceWeekday,
            recurrenceInterval: Math.max(1, recurrenceInterval || 1),
            recurrenceEndDate: recurrenceEndDate || null,
          }
        : { recurrenceType: 'none' as const },
  })

  return (
    <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center px-4" onClick={onClose}>
      <div
        className="bg-[#1e1e1e] rounded-2xl border border-border/50 max-w-2xl w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="space-y-1">
            <div className="text-lg font-bold text-foreground">Edit management event</div>
            <div className="text-xs text-muted-foreground">Update details or delete the event</div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[70vh]">
          {loadState === 'loading' && (
            <div className="text-sm text-muted-foreground py-8 text-center">Loading event…</div>
          )}
          {loadState === 'error' && (
            <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded p-2">{loadError}</div>
          )}
          {loadState === 'ready' && (
            <>
              {error && <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded p-2">{error}</div>}

              <div className="space-y-2">
                <Label htmlFor="edit-title">Title *</Label>
                <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Event type *</Label>
                  <Select
                    id="edit-type"
                    options={[
                      { value: 'management_meeting', label: 'Management meeting' },
                      { value: 'pubwatch', label: 'Pubwatch' },
                      { value: 'disciplinary', label: 'Disciplinary' },
                      { value: 'custom', label: 'Custom' },
                    ]}
                    value={eventType}
                    onChange={(v) => setEventType(v as ManagementEventType)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-site">Site (optional)</Label>
                  <Input id="edit-site" value={site} onChange={(e) => setSite(e.target.value)} placeholder="e.g., Spirits" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-startDate">Start date *</Label>
                  <Input id="edit-startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-startTime">Start time (optional)</Label>
                  <Input id="edit-startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-endDate">End date (optional)</Label>
                  <Input id="edit-endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-endTime">End time (optional)</Label>
                  <Input id="edit-endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-recurrenceType">Recurrence</Label>
                <Select
                  id="edit-recurrenceType"
                  options={[
                    { value: 'none', label: 'No recurrence' },
                    { value: 'weekly', label: 'Repeat weekly' },
                  ]}
                  value={recurrenceType}
                  onChange={(v) => setRecurrenceType(v as RecurrenceType)}
                />
              </div>

              {recurrenceType === 'weekly' && (
                <div className="space-y-4 border-t border-border/50 pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-weekday">Repeat on *</Label>
                      <Select
                        id="edit-weekday"
                        options={weekdayOptions.map((o) => ({ value: String(o.value), label: o.label }))}
                        value={String(recurrenceWeekday)}
                        onChange={(v) => setRecurrenceWeekday(Number(v))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-interval">Interval in weeks *</Label>
                      <Input
                        id="edit-interval"
                        type="number"
                        min={1}
                        value={recurrenceInterval}
                        onChange={(e) => setRecurrenceInterval(Number(e.target.value || 1))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-recurEnd">Repeat until (optional)</Label>
                    <Input
                      id="edit-recurEnd"
                      type="date"
                      value={recurrenceEndDate}
                      onChange={(e) => setRecurrenceEndDate(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description (optional)</Label>
                <Input
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Extra details"
                />
              </div>

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-between sm:items-center">
                <Button
                  type="button"
                  variant="outline"
                  className="border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  disabled={submitting}
                  onClick={async () => {
                    if (!window.confirm('Delete this event? This cannot be undone.')) return
                    try {
                      setSubmitting(true)
                      onSubmittingChange?.(true)
                      setError(null)
                      const res = await fetch(`/api/management-calendar/events/${eventId}`, { method: 'DELETE' })
                      const data = await res.json()
                      if (!res.ok) {
                        throw new Error(data.error || 'Failed to delete event')
                      }
                      await onSaved()
                    } catch (e) {
                      setError(e instanceof Error ? e.message : 'Failed to delete event')
                    } finally {
                      setSubmitting(false)
                      onSubmittingChange?.(false)
                    }
                  }}
                >
                  Delete event
                </Button>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={onClose} type="button" disabled={submitting}>
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      try {
                        setSubmitting(true)
                        onSubmittingChange?.(true)
                        setError(null)

                        if (!title.trim()) {
                          setError('Title is required')
                          return
                        }
                        if (!startDate) {
                          setError('Start date is required')
                          return
                        }

                        const payload = buildPayload()
                        const res = await fetch(`/api/management-calendar/events/${eventId}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(payload),
                        })
                        const data = await res.json()
                        if (!res.ok) {
                          throw new Error(data.error || 'Failed to update event')
                        }

                        await onSaved()
                      } catch (e) {
                        setError(e instanceof Error ? e.message : 'Failed to update event')
                      } finally {
                        setSubmitting(false)
                        onSubmittingChange?.(false)
                      }
                    }}
                    disabled={submitting}
                  >
                    {submitting ? 'Saving…' : 'Save changes'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

