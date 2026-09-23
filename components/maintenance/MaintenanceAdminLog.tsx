'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { ChevronLeft, ChevronRight, MapPin, Loader2, StickyNote, Pencil, Coffee } from 'lucide-react'
import type { MaintenanceShift } from '@/types/database'
import { toYyyyMmDdLocal, parseYyyyMmDdLocal } from '@/lib/date-utils'
import { formatMs, openBreak, shiftBreakMs, shiftWorkedMs } from '@/lib/maintenance-hours'

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

/** ISO timestamp -> value for a datetime-local input, in the viewer's local time. */
function toDateTimeLocal(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${toYyyyMmDdLocal(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function mapUrl(lat: number | null, lng: number | null): string | null {
  if (lat == null || lng == null) return null
  return `https://www.google.com/maps?q=${lat},${lng}`
}

export function MaintenanceAdminLog() {
  const [date, setDate] = useState(() => toYyyyMmDdLocal(new Date()))
  const [shifts, setShifts] = useState<MaintenanceShift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<MaintenanceShift | null>(null)
  const [editClockIn, setEditClockIn] = useState('')
  const [editClockOut, setEditClockOut] = useState('')
  const [editError, setEditError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

  const load = useCallback(async (forDate: string) => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/maintenance/shifts?date=${forDate}`)
      if (!res.ok) throw new Error('Failed to load maintenance log')
      const data = await res.json()
      setShifts(data.shifts ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(date)
  }, [date, load])

  const shiftDate = (deltaDays: number) => {
    const d = parseYyyyMmDdLocal(date)
    d.setDate(d.getDate() + deltaDays)
    setDate(toYyyyMmDdLocal(d))
  }

  const openEditor = (shift: MaintenanceShift) => {
    setEditing(shift)
    setEditClockIn(toDateTimeLocal(shift.clockInAt))
    // Forgotten clock-outs have no time yet — start from the clock-in so the manager
    // picks the real finish time rather than accidentally saving "now".
    setEditClockOut(toDateTimeLocal(shift.clockOutAt ?? shift.clockInAt))
    setEditError(null)
  }

  const saveEdit = async () => {
    if (!editing) return
    if (!editClockIn || !editClockOut) {
      setEditError('Both times are required')
      return
    }
    const clockInAt = new Date(editClockIn)
    const clockOutAt = new Date(editClockOut)
    if (clockOutAt <= clockInAt) {
      setEditError('Clock out must be after clock in')
      return
    }

    setSaving(true)
    setEditError(null)
    try {
      const res = await fetch('/api/maintenance/shifts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shiftId: editing.id,
          clockInAt: clockInAt.toISOString(),
          clockOutAt: clockOutAt.toISOString(),
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to update shift')
      }
      setEditing(null)
      await load(date)
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update shift')
    } finally {
      setSaving(false)
    }
  }

  const isToday = date === toYyyyMmDdLocal(new Date())

  // Per-person totals for the day, with breaks taken off
  const dailyTotals = Object.values(
    shifts.reduce<Record<string, { name: string; workedMs: number; breakMs: number; open: boolean }>>(
      (acc, shift) => {
        const entry = (acc[shift.userId] ??= {
          name: shift.user?.name ?? 'Unknown',
          workedMs: 0,
          breakMs: 0,
          open: false,
        })
        entry.workedMs += shiftWorkedMs(shift)
        entry.breakMs += shiftBreakMs(shift)
        entry.open ||= !shift.clockOutAt
        return acc
      },
      {}
    )
  ).sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" size="icon" onClick={() => shiftDate(-1)} aria-label="Previous day">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <input
          type="date"
          value={date}
          onChange={(e) => e.target.value && setDate(e.target.value)}
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm text-foreground"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={() => shiftDate(1)}
          disabled={isToday}
          aria-label="Next day"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : shifts.length === 0 ? (
        <Card className="border-border/40">
          <CardContent className="p-10 text-center text-muted-foreground">
            No maintenance shifts recorded on this day
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <Card className="bg-[#1e1e1e]/80 border-amber-500/30">
            <CardContent className="p-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Hours worked
              </p>
              {dailyTotals.map((t) => (
                <div key={t.name} className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="text-foreground truncate">
                    {t.name}
                    {t.open && <span className="ml-1.5 text-[10px] uppercase text-amber-300">in progress</span>}
                  </span>
                  <span className="shrink-0 tabular-nums">
                    <span className="font-semibold text-amber-300">{formatMs(t.workedMs)}</span>
                    {t.breakMs > 0 && (
                      <span className="ml-1.5 text-xs text-muted-foreground">({formatMs(t.breakMs)} break)</span>
                    )}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {shifts.map((shift) => {
            const clockInMap = mapUrl(shift.clockInLat, shift.clockInLng)
            const clockOutMap = mapUrl(shift.clockOutLat, shift.clockOutLng)
            const breakMs = shiftBreakMs(shift)
            const onBreak = openBreak(shift)
            return (
              <Card key={shift.id} className="bg-[#1e1e1e]/80 border-border/40">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-foreground">
                        {shift.user?.name ?? 'Unknown'}
                        {shift.user?.role && shift.user.role !== 'maintenance' && (
                          <span className="ml-1.5 rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground align-middle">
                            {shift.user.role.charAt(0).toUpperCase() + shift.user.role.slice(1)}
                          </span>
                        )}
                      </p>
                      {shift.venue && (
                        <p className="text-xs text-muted-foreground">{shift.venue}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-semibold text-amber-300 tabular-nums">
                        {formatMs(shiftWorkedMs(shift))} worked
                      </span>
                      {shift.clockOutAt && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => openEditor(shift)}
                          aria-label="Edit shift times"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Clock in</p>
                      <p className="text-foreground">{formatTime(shift.clockInAt)}</p>
                      {clockInMap && (
                        <a
                          href={clockInMap}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-spirits-cyan"
                        >
                          <MapPin className="h-3 w-3" /> View location
                        </a>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Clock out</p>
                      {shift.clockOutAt ? (
                        <>
                          <p className="text-foreground">
                            {formatTime(shift.clockOutAt)}
                            {shift.closedByAdmin && (
                              <span className="ml-1 text-[10px] uppercase text-muted-foreground">(force closed)</span>
                            )}
                          </p>
                          {clockOutMap && (
                            <a
                              href={clockOutMap}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-spirits-cyan"
                            >
                              <MapPin className="h-3 w-3" /> View location
                            </a>
                          )}
                        </>
                      ) : (
                        <div className="space-y-1.5">
                          <p className="text-amber-300 text-xs font-medium">Still clocked in</p>
                          <Button size="sm" variant="outline" onClick={() => openEditor(shift)}>
                            Set clock out
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {(shift.breaks?.length ?? 0) > 0 && (
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <Coffee className="h-3.5 w-3.5 shrink-0 mt-px" />
                      <div className="space-y-0.5">
                        {[...(shift.breaks ?? [])]
                          .sort((a, b) => a.startAt.localeCompare(b.startAt))
                          .map((b) => (
                            <p key={b.id} className="tabular-nums">
                              Break {formatTime(b.startAt)} – {b.endAt ? formatTime(b.endAt) : 'now'}
                              {!b.endAt && <span className="ml-1 text-sky-300">(on break)</span>}
                            </p>
                          ))}
                        <p>
                          Total break {formatMs(breakMs)}
                          {onBreak ? '' : ` · shift length ${formatMs(shiftWorkedMs(shift) + breakMs)}`}
                        </p>
                      </div>
                    </div>
                  )}

                  {shift.editedAt && (
                    <p className="text-[11px] text-muted-foreground">
                      Times edited by {shift.editor?.name ?? 'a manager'} on{' '}
                      {new Date(shift.editedAt).toLocaleString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}

                  {shift.notes && (
                    <div className="flex gap-2 rounded-lg border border-border/40 bg-background/40 px-3 py-2 text-sm text-foreground">
                      <StickyNote className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                      <p className="whitespace-pre-wrap">{shift.notes}</p>
                    </div>
                  )}

                  {shift.photos && shift.photos.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {shift.photos.map((url) => (
                        <button
                          key={url}
                          type="button"
                          onClick={() => setLightboxUrl(url)}
                          className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border/40"
                        >
                          <img src={url} alt="Shift photo" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={editing !== null} onOpenChange={(open) => !open && !saving && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing?.clockOutAt ? 'Edit shift' : 'Set clock out'} — {editing?.user?.name ?? 'Unknown'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 px-4 pb-6 sm:px-6">
            {editing && !editing.clockOutAt && (
              <p className="text-sm text-muted-foreground">
                They didn&apos;t clock out. Enter the time they actually finished.
              </p>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="edit-clock-in">Clock in</Label>
              <input
                id="edit-clock-in"
                type="datetime-local"
                value={editClockIn}
                onChange={(e) => setEditClockIn(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-clock-out">Clock out</Label>
              <input
                id="edit-clock-out"
                type="datetime-local"
                value={editClockOut}
                onChange={(e) => setEditClockOut(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground"
              />
            </div>
            {editing && editClockIn && editClockOut && new Date(editClockOut) > new Date(editClockIn) && (() => {
              const preview = {
                ...editing,
                clockInAt: new Date(editClockIn).toISOString(),
                clockOutAt: new Date(editClockOut).toISOString(),
              }
              const previewBreakMs = shiftBreakMs(preview)
              return (
                <p className="text-sm text-muted-foreground">
                  Hours worked:{' '}
                  <span className="font-semibold text-amber-300">{formatMs(shiftWorkedMs(preview))}</span>
                  {previewBreakMs > 0 && ` (after ${formatMs(previewBreakMs)} break)`}
                </p>
              )
            })()}
            {editError && (
              <div className="bg-destructive/10 border border-destructive/50 text-destructive px-3 py-2 rounded-xl text-sm">
                {editError}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={saveEdit} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <img src={lightboxUrl} alt="Shift photo" className="max-h-full max-w-full rounded-lg object-contain" />
        </div>
      )}
    </div>
  )
}
