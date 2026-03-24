'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { DayButtonProps } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Calendar as CalendarIcon, Clock, Plus, X } from 'lucide-react'
import { toYyyyMmDdLocal } from '@/lib/date-utils'
import { cn } from '@/lib/utils'

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

function ManagementDayButton({ day, modifiers, className, children, ...buttonProps }: DayButtonProps) {
  const ctx = useManagementCalendarContext()
  const ref = useRef<HTMLButtonElement>(null)
  const dateStr = toYyyyMmDdLocal(day.date)
  const dayEvents = ctx.occurrencesByDate[dateStr] || []

  useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <button ref={ref} type="button" className={className} {...buttonProps}>
      <div className="flex w-full items-start justify-between gap-1">
        <div className="text-xs font-semibold text-foreground">{children}</div>
        {dayEvents.length > 0 && (
          <div className="text-[10px] text-muted-foreground">{dayEvents.length}</div>
        )}
      </div>

      {dayEvents.length > 0 && (
        <div className="mt-1 w-full space-y-1">
          {dayEvents.slice(0, 2).map((ev) => (
            <div
              key={`${dateStr}-${ev.occurrenceId}`}
              className={cn(
                'truncate rounded-lg border px-2 py-0.5 text-[10px] leading-tight',
                getEventBadgeClass(ev.eventType)
              )}
              title={ev.title}
            >
              {ev.title}
            </div>
          ))}
          {dayEvents.length > 2 && (
            <div className="text-[9px] text-muted-foreground">+{dayEvents.length - 2} more</div>
          )}
        </div>
      )}
    </button>
  )
}

export function ManagementCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [occurrences, setOccurrences] = useState<Occurrence[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

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
      hasEvents: (d: Date) => (occurrencesByDate[toYyyyMmDdLocal(d)] || []).length > 0,
      noEvents: (d: Date) => (occurrencesByDate[toYyyyMmDdLocal(d)] || []).length === 0,
    }),
    [occurrencesByDate]
  )

  const modifiersClassNames = useMemo(
    () => ({
      hasEvents:
        '[&_button]:rounded-2xl [&_button]:border [&_button]:border-spirits-magenta/35 [&_button]:bg-spirits-magenta/[0.08] [&_button]:hover:border-spirits-magenta/50 [&_button]:hover:bg-spirits-magenta/[0.12]',
      noEvents:
        '[&_button]:rounded-2xl [&_button]:border [&_button]:border-border/30 [&_button]:bg-black/10 [&_button]:hover:border-border/45 [&_button]:hover:bg-white/[0.04]',
    }),
    []
  )

  const refresh = async () => {
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-6 w-6 shrink-0 text-spirits-magenta" />
          <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            Management calendar
          </h2>
        </div>

        <Button
          className="w-full rounded-xl sm:w-auto"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add event
        </Button>
      </div>

      <Card className="rounded-2xl border border-border/50 bg-[#1e1e1e] p-5 sm:p-6">
        <CardContent className="relative min-h-[320px] p-0">
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
                    <div className="space-y-1">
                      <div className="font-semibold text-foreground">{ev.title}</div>
                      <div className="text-xs text-muted-foreground">{eventTypeLabel[ev.eventType]}</div>
                      {ev.description && <div className="text-sm text-muted-foreground whitespace-pre-wrap">{ev.description}</div>}
                      {ev.site && <div className="text-xs text-muted-foreground">Site: {ev.site}</div>}
                    </div>
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
          onCreated={async () => {
            setShowAddModal(false)
            await refresh()
          }}
        />
      )}
    </div>
  )
}

function AddEventModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: () => void | Promise<void>
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
                  setError(null)

                  if (!title.trim()) {
                    setError('Title is required')
                    return
                  }
                  if (!startDate) {
                    setError('Start date is required')
                    return
                  }

                  const payload: any = {
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

