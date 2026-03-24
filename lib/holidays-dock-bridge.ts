export type HolidaysViewMode = 'calendar' | 'upcoming_list' | 'previous_list'

export type HolidaysDockPhase = 'browse' | 'day_edit'

export type HolidaysDockSyncDetail = {
  phase: HolidaysDockPhase
  view: HolidaysViewMode
  dayEdit?: {
    dateLabel: string
    status: 'green' | 'yellow' | 'red'
    notes: string
    fetching?: boolean
    submitting?: boolean
    error?: string | null
  }
}

export const HOLIDAYS_SYNC = 'holidays:sync' as const
export const HOLIDAYS_SET_VIEW = 'holidays:set-view' as const
export const HOLIDAYS_DOCK_BACK = 'holidays:dock-back' as const
export const HOLIDAYS_ADD = 'holidays:add' as const
export const HOLIDAYS_DAY_CANCEL = 'holidays:day-cancel' as const
export const HOLIDAYS_DAY_CONFIRM = 'holidays:day-confirm' as const
export const HOLIDAYS_DAY_SET_STATUS = 'holidays:day-set-status' as const
export const HOLIDAYS_DAY_NOTES_CHANGE = 'holidays:day-notes-change' as const

export function emitHolidaysDockSync(detail: HolidaysDockSyncDetail) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent<HolidaysDockSyncDetail>(HOLIDAYS_SYNC, { detail }))
}
