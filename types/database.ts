// Database type definitions for Gaitens Leisure Portal

export type UserRole = 'staff' | 'manager' | 'admin'

export interface User {
  id: string
  name: string
  staffCode: string // 4 digit code
  role: UserRole
  site: string | null
  createdAt: string
  active: boolean
}

export interface HolidayRequest {
  id: string
  userId: string
  startDate: string
  endDate: string
  status: 'pending' | 'approved' | 'rejected'
  reason: string | null
  createdAt: string
  updatedAt: string
}

export interface HolidayCalendarEvent {
  id: string
  userId: string
  date: string
  type: 'holiday' | 'approved_request'
  title: string | null
  createdAt: string
}

export interface TrainingCourse {
  id: string
  title: string
  description: string | null
  videoUrl: string | null
  content: string | null
  quizQuestions: QuizQuestion[]
  createdAt: string
  updatedAt: string
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
}

export interface TrainingCompletion {
  id: string
  userId: string
  courseId: string
  completedAt: string
  expiresAt: string // 365 days from completion
  score: number | null
}

export interface Notice {
  id: string
  title: string
  content: string
  attachments: string[] | null
  createdAt: string
  expiresAt: string | null
  pinned: boolean
  createdBy: string
}

export interface Grievance {
  id: string
  userId: string
  subject: string
  content: string
  status: 'submitted' | 'in_review' | 'resolved'
  createdAt: string
  updatedAt: string
}

export interface Idea {
  id: string
  userId: string
  title: string
  description: string
  status: 'submitted' | 'under_review' | 'implemented' | 'rejected'
  createdAt: string
  updatedAt: string
}

export interface EmployeeVote {
  id: string
  voterId: string
  nomineeId: string
  reason: string
  month: string // Format: YYYY-MM
  createdAt: string
}

export interface EmployeeWinner {
  id: string
  userId: string
  month: string // Format: YYYY-MM
  createdAt: string
}

export interface Meeting {
  id: string
  createdBy: string
  title: string
  date: string
  location: string | null
  attendees: string[] // Array of user IDs
  notes: string | null
  createdAt: string
  updatedAt: string
}
