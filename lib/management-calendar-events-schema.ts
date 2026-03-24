import { z } from 'zod'

export const ymdSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

const recurrenceWeeklySchema = z.object({
  recurrenceType: z.literal('weekly'),
  recurrenceWeekday: z.number().int().min(0).max(6),
  recurrenceInterval: z.number().int().min(1).optional().default(1),
  recurrenceEndDate: ymdSchema.optional().nullable(),
})

const recurrenceNoneSchema = z.object({
  recurrenceType: z.literal('none'),
})

export const recurrenceSchema = z.union([recurrenceWeeklySchema, recurrenceNoneSchema])

export const createEventSchema = z.object({
  title: z.string().min(1).max(200),
  eventType: z.enum(['management_meeting', 'pubwatch', 'disciplinary', 'custom']),
  description: z.string().max(2000).optional().nullable(),
  site: z.string().optional().nullable(),

  startDate: ymdSchema,
  endDate: ymdSchema.optional().nullable(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),

  visible: z.boolean().optional().default(true),
  recurrence: recurrenceSchema,
})

export type ManagementCalendarEventRow = {
  id: string
  title: string
  event_type: 'management_meeting' | 'pubwatch' | 'disciplinary' | 'custom'
  description: string | null
  site: string | null
  start_date: string
  end_date: string | null
  start_time: string | null
  end_time: string | null

  recurrence_type: 'none' | 'weekly'
  recurrence_weekday: number | null
  recurrence_interval: number
  recurrence_end_date: string | null

  visible: boolean
}

/** Strip TIME to HH:mm for HTML time inputs */
export function trimTimeForInput(t: string | null): string {
  if (!t) return ''
  return t.slice(0, 5)
}

export function rowToClientEvent(row: ManagementCalendarEventRow) {
  const recurrence =
    row.recurrence_type === 'weekly'
      ? {
          recurrenceType: 'weekly' as const,
          recurrenceWeekday: row.recurrence_weekday ?? 0,
          recurrenceInterval: Math.max(1, row.recurrence_interval || 1),
          recurrenceEndDate: row.recurrence_end_date,
        }
      : { recurrenceType: 'none' as const }

  return {
    id: row.id,
    title: row.title,
    eventType: row.event_type,
    description: row.description,
    site: row.site,
    startDate: row.start_date,
    endDate: row.end_date,
    startTime: trimTimeForInput(row.start_time) || null,
    endTime: trimTimeForInput(row.end_time) || null,
    visible: row.visible,
    recurrence,
  }
}

function baseDbFields(validated: z.infer<typeof createEventSchema>) {
  return {
    title: validated.title.trim(),
    event_type: validated.eventType,
    description: validated.description ?? null,
    site: validated.site ?? null,
    start_date: validated.startDate,
    end_date: validated.endDate ?? null,
    start_time: validated.startTime ?? null,
    end_time: validated.endTime ?? null,
    visible: validated.visible,
    recurrence_type: validated.recurrence.recurrenceType,
    recurrence_weekday:
      validated.recurrence.recurrenceType === 'weekly' ? validated.recurrence.recurrenceWeekday : null,
    recurrence_interval:
      validated.recurrence.recurrenceType === 'weekly' ? validated.recurrence.recurrenceInterval : 1,
    recurrence_end_date:
      validated.recurrence.recurrenceType === 'weekly'
        ? validated.recurrence.recurrenceEndDate ?? null
        : null,
  }
}

export function validatedBodyToInsertRow(validated: z.infer<typeof createEventSchema>) {
  return baseDbFields(validated)
}

export function validatedBodyToUpdateRow(validated: z.infer<typeof createEventSchema>) {
  return {
    ...baseDbFields(validated),
    updated_at: new Date().toISOString(),
  }
}
