'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, CircleDashed } from 'lucide-react'
import type { MaintenanceRotaShift } from '@/types/database'

/** Job reference photos as thumbnails; tap to view full size. */
export function RotaPhotoStrip({ photos }: { photos: string[] | null | undefined }) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  if (!photos || photos.length === 0) return null

  return (
    <>
      <div className="flex flex-wrap gap-2 mt-2">
        {photos.map((url) => (
          <button
            key={url}
            type="button"
            onClick={() => setLightboxUrl(url)}
            className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border/40"
          >
            <img src={url} alt="Job photo" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <img src={lightboxUrl} alt="Job photo" className="max-h-full max-w-full rounded-lg object-contain" />
        </div>
      )}
    </>
  )
}

/** Done / not done / outstanding pill. `past` turns an unmarked job into "Not marked". */
export function RotaStatusBadge({ shift, past = false }: { shift: MaintenanceRotaShift; past?: boolean }) {
  const status = shift.status ?? 'pending'
  if (status === 'done') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
        <CheckCircle2 className="h-3 w-3" /> Done
      </span>
    )
  }
  if (status === 'not_done') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[11px] font-medium text-red-300">
        <XCircle className="h-3 w-3" /> Not done
      </span>
    )
  }
  if (!past) return null
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-300">
      <CircleDashed className="h-3 w-3" /> Not marked
    </span>
  )
}

/** "Done by Jo · Ran out of parts" line under a marked job. */
export function RotaCompletionNote({ shift }: { shift: MaintenanceRotaShift }) {
  if (!shift.status || shift.status === 'pending') return null
  const who = shift.completedBy?.name
  if (!who && !shift.completionNotes) return null
  return (
    <p className="text-xs text-muted-foreground mt-1">
      {who && <span className="text-foreground/70">{who}: </span>}
      {shift.completionNotes || (shift.status === 'done' ? 'Marked done' : 'Marked not done')}
    </p>
  )
}
