import type { MaintenanceShift } from '@/types/database'

/** Break time within a shift, in ms. Open breaks/shifts run to `now`; breaks are clipped to the shift window. */
export function shiftBreakMs(shift: MaintenanceShift, now: number = Date.now()): number {
  const shiftStart = new Date(shift.clockInAt).getTime()
  const shiftEnd = shift.clockOutAt ? new Date(shift.clockOutAt).getTime() : now
  let total = 0
  for (const b of shift.breaks ?? []) {
    const start = Math.max(new Date(b.startAt).getTime(), shiftStart)
    const end = Math.min(b.endAt ? new Date(b.endAt).getTime() : now, shiftEnd)
    if (end > start) total += end - start
  }
  return total
}

/** Hours actually worked (shift length minus breaks), in ms. */
export function shiftWorkedMs(shift: MaintenanceShift, now: number = Date.now()): number {
  const shiftStart = new Date(shift.clockInAt).getTime()
  const shiftEnd = shift.clockOutAt ? new Date(shift.clockOutAt).getTime() : now
  return Math.max(0, shiftEnd - shiftStart - shiftBreakMs(shift, now))
}

export function openBreak(shift: MaintenanceShift | null) {
  return shift?.breaks?.find((b) => !b.endAt) ?? null
}

export function formatMs(ms: number): string {
  const totalMinutes = Math.max(0, Math.round(ms / 60000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes}m`
  return `${hours}h ${minutes}m`
}
