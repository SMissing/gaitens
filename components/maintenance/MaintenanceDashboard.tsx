'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MapPin, Clock, Wrench, Image as ImageIcon, X, Loader2, CalendarClock, Coffee } from 'lucide-react'
import type { MaintenanceShift, MaintenanceRotaShift, User } from '@/types/database'
import { formatMs, openBreak, shiftBreakMs, shiftWorkedMs } from '@/lib/maintenance-hours'

interface MaintenanceDashboardProps {
  user: User
  /** Off on the Maintenance Shifts page, where the page header already says where you are. */
  showWelcome?: boolean
}

interface Coords {
  lat: number | null
  lng: number | null
  accuracy: number | null
}

function getLocation(): Promise<Coords> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve({ lat: null, lng: null, accuracy: null })
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      () => resolve({ lat: null, lng: null, accuracy: null }),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  })
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

/** Rota `date` is a plain YYYY-MM-DD DATE column — parse as local, not UTC. */
function formatRotaDay(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function formatTimeRange(start: string | null, end: string | null): string {
  const trim = (t: string) => t.slice(0, 5)
  if (start && end) return `${trim(start)} – ${trim(end)}`
  if (start) return `From ${trim(start)}`
  if (end) return `Until ${trim(end)}`
  return 'All day'
}

export function MaintenanceDashboard({ user, showWelcome = true }: MaintenanceDashboardProps) {
  const [loading, setLoading] = useState(true)
  const [openShift, setOpenShift] = useState<MaintenanceShift | null>(null)
  const [recent, setRecent] = useState<MaintenanceShift[]>([])
  const [upcomingRota, setUpcomingRota] = useState<MaintenanceRotaShift[]>([])
  const [error, setError] = useState<string | null>(null)

  const [clockingIn, setClockingIn] = useState(false)
  const [togglingBreak, setTogglingBreak] = useState(false)

  const [showClockOutForm, setShowClockOutForm] = useState(false)
  const [notes, setNotes] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [clockingOut, setClockingOut] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [, forceTick] = useState(0)

  const load = useCallback(async () => {
    try {
      setError(null)
      const [shiftsRes, rotaRes] = await Promise.all([
        fetch('/api/maintenance/shifts?mine=1'),
        fetch('/api/maintenance/rota?mine=1'),
      ])
      if (!shiftsRes.ok) throw new Error('Failed to load shift data')
      const data = await shiftsRes.json()
      setOpenShift(data.openShift ?? null)
      setRecent(data.recent ?? [])
      if (rotaRes.ok) {
        const rotaData = await rotaRes.json()
        setUpcomingRota(rotaData.shifts ?? [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Live-updating elapsed timer while clocked in
  useEffect(() => {
    if (!openShift) return
    const interval = setInterval(() => forceTick((t) => t + 1), 30000)
    return () => clearInterval(interval)
  }, [openShift])

  const handleClockIn = async () => {
    setClockingIn(true)
    setError(null)
    try {
      const coords = await getLocation()
      const res = await fetch('/api/maintenance/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clock_in', ...coords }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to clock in')
      }
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clock in')
    } finally {
      setClockingIn(false)
    }
  }

  const handleBreak = async (action: 'start_break' | 'end_break') => {
    setTogglingBreak(true)
    setError(null)
    try {
      const res = await fetch('/api/maintenance/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to update break')
      }
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update break')
    } finally {
      setTogglingBreak(false)
    }
  }

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (files.length === 0) return
    if (photos.length + files.length > 6) {
      setError('Up to 6 photos per shift')
      return
    }
    setUploadingPhoto(true)
    setError(null)
    try {
      for (const file of files) {
        const form = new FormData()
        form.append('file', file)
        const res = await fetch('/api/maintenance/upload', { method: 'POST', body: form })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Failed to upload photo')
        }
        const data = await res.json()
        setPhotos((prev) => [...prev, data.url])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload photo')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleClockOut = async () => {
    setClockingOut(true)
    setError(null)
    try {
      const coords = await getLocation()
      const res = await fetch('/api/maintenance/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clock_out', notes: notes.trim() || null, photos, ...coords }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to clock out')
      }
      setNotes('')
      setPhotos([])
      setShowClockOutForm(false)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clock out')
    } finally {
      setClockingOut(false)
    }
  }

  const currentBreak = openBreak(openShift)
  const breakTakenMs = openShift ? shiftBreakMs(openShift) : 0

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-4 pb-16 relative z-10">
      {showWelcome && <p className="text-muted-foreground text-sm mb-4">Welcome, {user.name}</p>}

      {error && (
        <div className="mb-4 bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {!openShift ? (
        <Card className="bg-[#1e1e1e]/60 backdrop-blur-md rounded-2xl border border-border/30 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-normal">
              <Wrench className="h-5 w-5 text-amber-400" />
              Clock In
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleClockIn} disabled={clockingIn} className="w-full">
              {clockingIn ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Getting location…
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4" /> Clock In
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              We record your location so the office can confirm you clocked in at the venue.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card
          className={`bg-[#1e1e1e]/60 backdrop-blur-md rounded-2xl border shadow-lg ${
            currentBreak ? 'border-sky-500/40' : 'border-amber-500/30'
          }`}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-normal">
              {currentBreak ? (
                <>
                  <Coffee className="h-5 w-5 text-sky-400" />
                  On break
                </>
              ) : (
                <>
                  <Wrench className="h-5 w-5 text-amber-400" />
                  Clocked in
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-border/40 bg-background/40 px-3 py-2.5 space-y-1.5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Since {formatTime(openShift.clockInAt)}</span>
                <span className="text-sm font-semibold text-amber-300 tabular-nums">
                  {formatMs(shiftWorkedMs(openShift))} worked
                </span>
              </div>
              {breakTakenMs > 0 && (
                <div className="flex items-baseline justify-between text-xs text-muted-foreground">
                  <span>Breaks</span>
                  <span className="tabular-nums">{formatMs(breakTakenMs)}</span>
                </div>
              )}
            </div>

            {currentBreak ? (
              <div className="space-y-2">
                <p className="text-sm text-sky-300 text-center">
                  Break started {formatTime(currentBreak.startAt)} ·{' '}
                  {formatMs(Date.now() - new Date(currentBreak.startAt).getTime())}
                </p>
                <Button onClick={() => handleBreak('end_break')} disabled={togglingBreak} className="w-full">
                  {togglingBreak ? <Loader2 className="h-4 w-4 animate-spin" /> : 'End Break — Clock Back In'}
                </Button>
              </div>
            ) : !showClockOutForm ? (
              <div className="flex gap-2">
                <Button
                  onClick={() => handleBreak('start_break')}
                  disabled={togglingBreak}
                  className="flex-1"
                  variant="outline"
                >
                  {togglingBreak ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Coffee className="h-4 w-4" /> Start Break
                    </>
                  )}
                </Button>
                <Button onClick={() => setShowClockOutForm(true)} className="flex-1" variant="outline">
                  Clock Out
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="shift-notes">What did you do today?</Label>
                  <Textarea
                    id="shift-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Notes for the office…"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Photos</Label>
                  <div className="flex flex-wrap gap-2">
                    {photos.map((url) => (
                      <div key={url} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border/40">
                        <img src={url} alt="Shift photo" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPhotos((prev) => prev.filter((p) => p !== url))}
                          className="absolute right-0.5 top-0.5 rounded-full bg-black/70 p-0.5"
                          aria-label="Remove photo"
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                      </div>
                    ))}
                    {photos.length < 6 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingPhoto}
                        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-border/60 text-muted-foreground disabled:opacity-50"
                      >
                        {uploadingPhoto ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <ImageIcon className="h-5 w-5" />
                        )}
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    capture="environment"
                    className="hidden"
                    onChange={handlePhotoSelect}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowClockOutForm(false)}
                    disabled={clockingOut}
                  >
                    Back
                  </Button>
                  <Button className="flex-1" onClick={handleClockOut} disabled={clockingOut || uploadingPhoto}>
                    {clockingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Clock Out'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {upcomingRota.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Upcoming Shifts
          </p>
          <div className="space-y-2">
            {upcomingRota.map((shift) => (
              <Card key={shift.id} className="bg-[#1e1e1e]/60 backdrop-blur-md rounded-xl border border-border/30">
                <CardContent className="p-3 flex items-start gap-2.5">
                  <CalendarClock className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {formatRotaDay(shift.date)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeRange(shift.startTime, shift.endTime)}
                    </p>
                    {shift.notes && (
                      <p className="text-xs text-muted-foreground mt-0.5">{shift.notes}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {recent.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Recent Shifts
          </p>
          <div className="space-y-2">
            {recent.map((shift) => (
              <Card key={shift.id} className="bg-[#1e1e1e]/60 backdrop-blur-md rounded-xl border border-border/30">
                <CardContent className="p-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {formatDay(shift.clockInAt)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(shift.clockInAt)}
                      {shift.clockOutAt ? ` – ${formatTime(shift.clockOutAt)}` : ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                      {formatMs(shiftWorkedMs(shift))}
                    </span>
                    {shiftBreakMs(shift) > 0 && (
                      <p className="text-[11px] text-muted-foreground/70 tabular-nums">
                        {formatMs(shiftBreakMs(shift))} break
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
