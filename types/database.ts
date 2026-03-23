// Database type definitions for Gaitens Leisure Portal

export type UserRole = 'staff' | 'manager' | 'admin'

export interface User {
  id: string
  name: string
  staffCode: string // 4 digit code
  role: UserRole
  site: string | null
  createdAt: string
  last_login_at?: string | null
  active: boolean
  /** Times user accepted Barred List disclaimer (see scripts/55-*.sql). */
  barredDisclaimerAcceptCount?: number
  barredDisclaimerLastAcceptedAt?: string | null
}

export type BarDurationUnit = 'days' | 'weeks' | 'months' | 'years'

export interface BarredPerson {
  id: string
  name: string | null
  imageUrl: string | null
  imagePath?: string | null
  reason: string
  barDurationValue: number
  barDurationUnit: BarDurationUnit
  barEndDate: string
  createdBy?: string
  createdAt: string
}

export interface HolidayRequest {
  id: string
  userId: string
  startDate: string
  endDate: string
  status: 'pending' | 'approved' | 'rejected'
  reason: string | null
  rejectionReason: string | null
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

export interface HolidayCalendarAvailability {
  id: string
  date: string
  status: 'green' | 'yellow' | 'red'
  updatedBy: string
  updatedAt: string
  notes: string | null
}

export interface TrainingCourse {
  id: string
  title: string
  description: string | null
  videoUrl: string | null
  content: string | null
  quizQuestions: QuizQuestion[]
  site: string | null // null means available to all sites
  requiredScope?: 'none' | 'site' | 'all'
  category: string | null // Category within the site (e.g., "Golf", "Bar", "Kitchen")
  createdBy: string | null
  moduleType: 'video' | 'text' | 'guide'
  duration: number | null // Duration in minutes
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface QuizQuestion {
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

export type AchievementRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary'

export interface Achievement {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  requiresProgress: boolean
  requiredCount: number
  rarity?: AchievementRarity
  createdAt: string
  updatedAt: string
}

export interface UserAchievement {
  id: string
  userId: string
  achievementId: string
  currentProgress: number
  completed: boolean
  awardedBy: string | null
  awardedAt: string
  achievement?: Achievement
}

export interface Grievance {
  id: string
  userId: string
  subject: string
  content: string
  employeeName: string
  relatesToEmployment: string
  howToResolve: string
  otherParties: string
  whatHasBeenDone: string
  status: 'submitted' | 'in_review' | 'resolved'
  createdAt: string
  updatedAt: string
}

export interface Idea {
  id: string
  userId: string
  venue: 'Garrison' | 'Spirits' | 'Bassment' | 'All'
  title: string
  description: string
  status: 'submitted' | 'under_review' | 'implemented' | 'rejected'
  createdAt: string
  updatedAt: string
  voteTotal?: number
  userVote?: 1 | -1 | null
}

export interface AnonymousReport {
  id: string
  note: string
  reportDate: string
  status: 'submitted' | 'in_review' | 'resolved'
  createdAt: string
  updatedAt: string
}

export interface UpcomingEvent {
  id: string
  title: string
  description: string | null
  eventDate: string
  eventTime: string | null
  location: string | null
  imageUrl: string | null
  imagePath: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface IdeaVote {
  id: string
  ideaId: string
  userId: string
  vote: 1 | -1 // 1 for upvote, -1 for downvote
  createdAt: string
}

export interface EmployeeVote {
  id: string
  voterId: string
  nomineeId: string
  reason: string | null
  month: string // Format: YYYY-MM
  createdAt: string
}

export interface EmployeeWinner {
  id: string
  userId: string
  month: string // Format: YYYY-MM
  type: 'staff_pick' | 'manager_pick'
  createdAt: string
}

export interface Meeting {
  id: string
  title: string
  description: string | null
  requestedBy: string
  requestedFor: string
  status: 'pending' | 'accepted' | 'reschedule_requested' | 'reschedule_proposed' | 'cancelled'
  suggestedDate: string
  suggestedTime: string | null
  meetingDate: string | null
  meetingTime: string | null
  rescheduleReason: string | null
  lastActionBy: string | null
  createdAt: string
  updatedAt: string
}

export interface Disciplinary {
  id: string
  userId: string
  createdBy: string
  reason: string | null
  createdAt: string
}

export interface Message {
  id: string
  userId: string
  content: string
  createdAt: string
}

export interface DailyCheckIn {
  id: string
  userId: string
  checkInDate: string
  createdAt: string
}

export interface UserStreak {
  id: string
  userId: string
  currentStreak: number
  longestStreak: number
  lastCheckInDate: string | null
  updatedAt: string
}
