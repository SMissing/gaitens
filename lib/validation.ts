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
  subject: z.string().min(1, 'Subject is required'),
  content: z.string().min(1, 'Content is required'),
})

// Idea schema
export const ideaSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
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
