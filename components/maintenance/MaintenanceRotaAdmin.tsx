'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, Loader2, CalendarClock } from 'lucide-react'
import type { MaintenanceRotaShift, User, UserRole } from '@/types/database'
import { staffListFromApiResponse } from '@/lib/staff-permissions'

function formatDay(dateStr: string): string {
  // dateStr is a YYYY-MM-DD DATE column — parse as local, not UTC
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

/** Maintenance accounts are the default; flag everyone else so the rota shows who's helping out. */
function roleTag(role: UserRole | undefined): string | null {
  if (!role || role === 'maintenance') return null
  return role.charAt(0).toUpperCase() + role.slice(1)
}

function formatTimeRange(start: string | null, end: string | null): string {
  const trim = (t: string) => t.slice(0, 5)
  if (start && end) return `${trim(start)} – ${trim(end)}`
  if (start) return `From ${trim(start)}`
  if (end) return `Until ${trim(end)}`
  return 'All day'
}

export function MaintenanceRotaAdmin() {
  const [staff, setStaff] = useState<User[]>([])
  const [shifts, setShifts] = useState<MaintenanceRotaShift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [userId, setUserId] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [staffRes, rotaRes] = await Promise.all([
        fetch('/api/staff?active=true'),
        fetch('/api/maintenance/rota'),
      ])
      if (!staffRes.ok || !rotaRes.ok) throw new Error('Failed to load rota')
      const staffData = await staffRes.json()
      const rotaData = await rotaRes.json()
      setStaff(staffListFromApiResponse(staffData))
      setShifts(rotaData.shifts ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Maintenance team first, then everyone else alphabetically
  const staffOptions = useMemo(
    () =>
      [...staff]
        .sort((a, b) => {
          const am = a.role === 'maintenance' ? 0 : 1
          const bm = b.role === 'maintenance' ? 0 : 1
          return am - bm || a.name.localeCompare(b.name)
        })
        .map((s) => {
          const tag = s.role === 'maintenance' ? 'Maintenance' : s.site || roleTag(s.role)
          return { value: s.id, label: tag ? `${s.name} · ${tag}` : s.name }
        }),
    [staff]
  )

  const grouped = useMemo(() => {
    const map = new Map<string, MaintenanceRotaShift[]>()
    for (const shift of shifts) {
      const list = map.get(shift.date) ?? []
      list.push(shift)
      map.set(shift.date, list)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [shifts])

  const handleSubmit = async () => {
    if (!userId || !date) {
      setError('Choose a staff member and date')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/maintenance/rota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          date,
          startTime: startTime || null,
          endTime: endTime || null,
          notes: notes.trim() || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to schedule shift')
      }
      setUserId('')
      setStartTime('')
      setEndTime('')
      setNotes('')
      setShowForm(false)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule shift')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    setError(null)
    try {
      const res = await fetch(`/api/maintenance/rota/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to delete shift')
      }
      setShifts((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete shift')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {!showForm ? (
        <Button onClick={() => setShowForm(true)} className="w-full" disabled={staff.length === 0}>
          <Plus className="h-4 w-4" /> Schedule Shift
        </Button>
      ) : (
        <Card className="bg-[#1e1e1e]/80 border-border/40">
          <CardContent className="p-4 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="rota-staff">Staff member</Label>
              <Select
                id="rota-staff"
                options={staffOptions}
                value={userId}
                onChange={setUserId}
                placeholder="Choose staff member"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rota-date">Date</Label>
              <input
                id="rota-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="rota-start">Start (optional)</Label>
                <input
                  id="rota-start"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rota-end">End (optional)</Label>
                <input
                  id="rota-end"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rota-notes">Job (optional)</Label>
              <Textarea
                id="rota-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Boiler service at Spirits"
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)} disabled={saving}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Schedule Shift'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : staff.length === 0 ? (
        <Card className="border-border/40">
          <CardContent className="p-10 text-center text-muted-foreground">
            No active staff accounts found.
          </CardContent>
        </Card>
      ) : grouped.length === 0 ? (
        <Card className="border-border/40">
          <CardContent className="p-10 text-center text-muted-foreground">
            No shifts scheduled in the next 60 days
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {grouped.map(([dateStr, dayShifts]) => (
            <div key={dateStr}>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                {formatDay(dateStr)}
              </p>
              <div className="space-y-2">
                {dayShifts.map((shift) => (
                  <Card key={shift.id} className="bg-[#1e1e1e]/80 border-border/40">
                    <CardContent className="p-3 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex items-start gap-2.5">
                        <CalendarClock className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {shift.user?.name ?? 'Unknown'}
                            {roleTag(shift.user?.role) && (
                              <span className="ml-1.5 rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground align-middle">
                                {roleTag(shift.user?.role)}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatTimeRange(shift.startTime, shift.endTime)}
                          </p>
                          {shift.notes && (
                            <p className="text-xs text-muted-foreground mt-0.5">{shift.notes}</p>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(shift.id)}
                        disabled={deletingId === shift.id}
                        className="shrink-0 rounded-lg p-1.5 text-muted-foreground active:bg-white/[0.08] active:text-destructive touch-manipulation disabled:opacity-50"
                        aria-label="Remove shift"
                      >
                        {deletingId === shift.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
