'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, Loader2, CalendarClock, Pencil, Image as ImageIcon, X } from 'lucide-react'
import type { MaintenanceRotaShift, User, UserRole } from '@/types/database'
import { staffListFromApiResponse } from '@/lib/staff-permissions'
import { RotaCompletionNote, RotaPhotoStrip, RotaStatusBadge } from './RotaJobParts'

const MAX_PHOTOS = 6
const PAST_DAYS = 14

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

function isoDate(offsetDays: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().split('T')[0]
}

type View = 'upcoming' | 'past'

export function MaintenanceRotaAdmin() {
  const [staff, setStaff] = useState<User[]>([])
  const [shifts, setShifts] = useState<MaintenanceRotaShift[]>([])
  const [view, setView] = useState<View>('upcoming')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Form is shared by "Schedule Shift" (editingId null) and editing an existing shift
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [userId, setUserId] = useState('')
  const [date, setDate] = useState(() => isoDate(0))
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [notes, setNotes] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async (which: View) => {
    try {
      setLoading(true)
      setError(null)
      const rotaUrl =
        which === 'past'
          ? `/api/maintenance/rota?from=${isoDate(-PAST_DAYS)}&to=${isoDate(-1)}`
          : '/api/maintenance/rota'
      const [staffRes, rotaRes] = await Promise.all([fetch('/api/staff?active=true'), fetch(rotaUrl)])
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
    load(view)
  }, [load, view])

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
    const entries = Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
    // Past view reads most recent day first
    return view === 'past' ? entries.reverse() : entries
  }, [shifts, view])

  const resetForm = () => {
    setEditingId(null)
    setUserId('')
    setDate(isoDate(0))
    setStartTime('')
    setEndTime('')
    setNotes('')
    setPhotos([])
    setShowForm(false)
  }

  const startEdit = (shift: MaintenanceRotaShift) => {
    setEditingId(shift.id)
    setUserId(shift.userId)
    setDate(shift.date)
    setStartTime(shift.startTime?.slice(0, 5) ?? '')
    setEndTime(shift.endTime?.slice(0, 5) ?? '')
    setNotes(shift.notes ?? '')
    setPhotos(shift.photos ?? [])
    setShowForm(false)
    setError(null)
  }

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (files.length === 0) return
    if (photos.length + files.length > MAX_PHOTOS) {
      setError(`Up to ${MAX_PHOTOS} photos per job`)
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

  const handleSubmit = async () => {
    if (!userId || !date) {
      setError('Choose a staff member and date')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(editingId ? `/api/maintenance/rota/${editingId}` : '/api/maintenance/rota', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          date,
          startTime: startTime || null,
          endTime: endTime || null,
          notes: notes.trim() || null,
          photos,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || (editingId ? 'Failed to save changes' : 'Failed to schedule shift'))
      }
      resetForm()
      await load(view)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save shift')
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

  const renderForm = () => (
    <Card className="bg-[#1e1e1e]/80 border-amber-500/30">
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
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label>Photos (optional)</Label>
          <div className="flex flex-wrap gap-2">
            {photos.map((url) => (
              <div key={url} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border/40">
                <img src={url} alt="Job photo" className="h-full w-full object-cover" />
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
            {photos.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-border/60 text-muted-foreground disabled:opacity-50"
                aria-label="Add photo"
              >
                {uploadingPhoto ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImageIcon className="h-5 w-5" />}
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handlePhotoSelect}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={resetForm} disabled={saving}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={saving || uploadingPhoto}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? 'Save Changes' : 'Schedule Shift'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {showForm && !editingId ? (
        renderForm()
      ) : (
        <Button
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
          className="w-full"
          disabled={staff.length === 0}
        >
          <Plus className="h-4 w-4" /> Schedule Shift
        </Button>
      )}

      <div className="grid grid-cols-2 gap-1 rounded-xl bg-white/[0.04] p-1">
        {(['upcoming', 'past'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => {
              resetForm()
              setView(v)
            }}
            className={`rounded-lg py-1.5 text-sm font-medium touch-manipulation ${
              view === v ? 'bg-white/[0.1] text-foreground' : 'text-muted-foreground'
            }`}
          >
            {v === 'upcoming' ? 'Upcoming' : `Past ${PAST_DAYS} days`}
          </button>
        ))}
      </div>

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
            {view === 'past'
              ? `No shifts in the last ${PAST_DAYS} days`
              : 'No shifts scheduled in the next 60 days'}
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
                {dayShifts.map((shift) =>
                  editingId === shift.id ? (
                    <div key={shift.id}>{renderForm()}</div>
                  ) : (
                    <Card key={shift.id} className="bg-[#1e1e1e]/80 border-border/40">
                      <CardContent className="p-3 flex items-start justify-between gap-2">
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
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-xs text-muted-foreground">
                                {formatTimeRange(shift.startTime, shift.endTime)}
                              </p>
                              <RotaStatusBadge shift={shift} past={view === 'past'} />
                            </div>
                            {shift.notes && (
                              <p className="text-xs text-muted-foreground mt-0.5 whitespace-pre-wrap">{shift.notes}</p>
                            )}
                            <RotaPhotoStrip photos={shift.photos} />
                            <RotaCompletionNote shift={shift} />
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center">
                          <button
                            type="button"
                            onClick={() => startEdit(shift)}
                            className="rounded-lg p-1.5 text-muted-foreground active:bg-white/[0.08] active:text-foreground touch-manipulation"
                            aria-label="Edit shift"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(shift.id)}
                            disabled={deletingId === shift.id}
                            className="rounded-lg p-1.5 text-muted-foreground active:bg-white/[0.08] active:text-destructive touch-manipulation disabled:opacity-50"
                            aria-label="Remove shift"
                          >
                            {deletingId === shift.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
