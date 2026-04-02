import { z } from 'zod'

// Staff code validation (4 digits)
export const staffCodeSchema = z
  .string()
  .length(4, 'Staff code must be exactly 4 digits')
  .regex(/^\d{4}$/, 'Staff code must contain only numbers')

// User creation schema
export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  staffCode: staffCodeSchema,
  role: z.enum(['staff', 'manager', 'admin']),
  site: z.string().nullable().optional(),
})

// Login schema
export const loginSchema = z.object({
  staffCode: staffCodeSchema,
})

// Holiday request schema
export const holidayRequestSchema = z.object({
  startDate: z.string().date(),
  endDate: z.string().date(),
  reason: z.string().nullable().optional(),
})

// Notice schema
export const noticeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  expiresAt: z.string().nullable().optional(),
  pinned: z.boolean().default(false),
})

// Grievance schema
export const grievanceSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject is too long'),
  content: z.string().min(1, 'What the grievance is - required').max(2000, 'Description is too long'),
  employeeName: z.string().min(1, 'Employee name is required').max(100, 'Name is too long'),
  relatesToEmployment: z.string().min(1, 'How it relates to employment is required').max(1000, 'Description is too long'),
  howToResolve: z.string().min(1, 'How the problem could be resolved is required').max(1000, 'Description is too long'),
  otherParties: z.string().min(1, 'Other parties involved is required').max(500, 'Description is too long'),
  whatHasBeenDone: z.string().min(1, 'What has been done to date is required').max(1000, 'Description is too long'),
})

// Idea schema
export const ideaSchema = z.object({
  venue: z.enum(['Garrison', 'Spirits', 'Bassment', 'All']),
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description is too long'),
})

export const appFeedbackSchema = z.object({
  category: z.enum(['feature', 'issue', 'question']),
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description is too long'),
})

export const appFeedbackAdminPatchSchema = z.object({
  adminStatus: z.enum(['open', 'denied', 'working_on_it', 'completed']),
  adminComment: z
    .string()
    .max(2000, 'Comment is too long')
    .nullable()
    .optional(),
})

// Employee vote schema
export const employeeVoteSchema = z.object({
  nomineeId: z.string().uuid(),
  reason: z.string().min(1, 'Reason is required'),
})

// Meeting schema
export const meetingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: z.string().date(),
  location: z.string().nullable().optional(),
  attendees: z.array(z.string().uuid()),
  notes: z.string().nullable().optional(),
})
