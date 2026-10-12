'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { CalendarClock, Check, Loader2, X } from 'lucide-react'
import type { MaintenanceRotaShift, MaintenanceRotaStatus } from '@/types/database'
import { RotaCompletionNote, RotaPhotoStrip, RotaStatusBadge } from './RotaJobParts'

function formatTimeRange(start: string | null, end: string | null): string {
  const trim = (t: string) => t.slice(0, 5)
  if (start && end) return `${trim(start)} – ${trim(end)}`
  if (start) return `From ${trim(start)}`
  if (end) return `Until ${trim(end)}`
  return 'All day'
}

interface RotaJobCardProps {
  shift: MaintenanceRotaShift
  title: string
  /** Previous day: an unmarked job shows as "Not marked". */
  past?: boolean
  /** Show the Done / Not done controls. */
  canMark?: boolean
  onUpdated: (shift: MaintenanceRotaShift) => void
}

/** A rota'd job as seen by the person doing it: details, photos, and done / not done. */
export function RotaJobCard({ shift, title, past = false, canMark = false, onUpdated }: RotaJobCardProps) {
  const [marking, setMarking] = useState<Exclude<MaintenanceRotaStatus, 'pending'> | null>(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const status = shift.status ?? 'pending'

  const save = async (next: MaintenanceRotaStatus) => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/maintenance/rota/${shift.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next, completionNotes: note.trim() || null }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to update job')
      }
      const data = await res.json()
      onUpdated(data.shift)
      setMarking(null)
      setNote('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update job')
    } finally {
      setSaving(false)
    }
  }

  const accent =
    status === 'done'
      ? 'border-emerald-500/30'
      : status === 'not_done' || past
        ? 'border-red-500/25'
        : 'border-border/30'

  return (
    <Card className={`bg-[#1e1e1e]/60 backdrop-blur-md rounded-xl border ${accent}`}>
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start gap-2.5">
          <CalendarClock className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-foreground truncate">{title}</p>
              <RotaStatusBadge shift={shift} past={past} />
            </div>
            <p className="text-xs text-muted-foreground">{formatTimeRange(shift.startTime, shift.endTime)}</p>
            {shift.notes && (
              <p className="text-xs text-muted-foreground mt-0.5 whitespace-pre-wrap">{shift.notes}</p>
            )}
            <RotaPhotoStrip photos={shift.photos} />
            <RotaCompletionNote shift={shift} />
          </div>
        </div>

        {canMark && !marking && (
          <div className="flex gap-2">
            {status !== 'done' && (
              <Button size="sm" variant="outline" className="flex-1" onClick={() => setMarking('done')}>
                <Check className="h-4 w-4" /> Done
              </Button>
            )}
            {status !== 'not_done' && (
              <Button size="sm" variant="outline" className="flex-1" onClick={() => setMarking('not_done')}>
                <X className="h-4 w-4" /> Not done
              </Button>
            )}
            {status !== 'pending' && (
              <Button size="sm" variant="ghost" className="flex-1" onClick={() => save('pending')} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Undo'}
              </Button>
            )}
          </div>
        )}

        {marking && (
          <div className="space-y-2">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={marking === 'done' ? 'Anything to add? (optional)' : "Why couldn't it be done? What's left?"}
              rows={2}
            />
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => setMarking(null)} disabled={saving}>
                Cancel
              </Button>
              <Button size="sm" className="flex-1" onClick={() => save(marking)} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : marking === 'done' ? (
                  'Mark Done'
                ) : (
                  'Mark Not Done'
                )}
              </Button>
            </div>
          </div>
        )}

        {error && <p className="text-xs text-destructive">{error}</p>}
      </CardContent>
    </Card>
  )
}
