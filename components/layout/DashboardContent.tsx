import Link from 'next/link'
import { createServerClient } from '@/lib/db'
import { formatDate, formatVotingMonth } from '@/lib/date-utils'
import type { Notice, User } from '@/types/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dock } from '@/components/core/dock'
import { DockButtonRow } from './DockButtonRow'
import { DockSwipeOverlay } from './DockSwipeOverlay'
import { DashboardNoticeCard } from '@/components/notices/DashboardNoticeCard'
import { UnreadNoticesModal } from '@/components/notices/UnreadNoticesModal'
import { AchievementNotificationManager } from '@/components/achievements/AchievementNotificationManager'
import { PushNotificationManager } from '@/components/notifications/PushNotificationManager'
import { PushNotificationButton } from '@/components/notifications/PushNotificationButton'
import { InstagramFeed } from '@/components/social/InstagramFeed'
import { NextEventCard } from '@/components/upcoming-events/NextEventCard'
import { EotmDashboardCard } from './EotmDashboardCard'
import { MeetingNotificationCard } from '@/components/meetings/MeetingNotificationCard'
import { MeetingCard } from '@/components/meetings/MeetingCard'
import dynamic from 'next/dynamic'

const DailyCheckInCard = dynamic(() => import('@/components/streaks/DailyCheckInCard'), {
  ssr: false,
  loading: () => (
    <Card>
      <CardContent className="py-6">
        <div className="text-center text-muted-foreground">
          <div className="animate-pulse">Loading...</div>
        </div>
      </CardContent>
    </Card>
  ),
})
import {
  BookOpen,
  Calendar,
  GraduationCap,
  MessageSquare,
  Lightbulb,
  FileText,
  Award,
  Building2,
  Users,
} from 'lucide-react'

interface DashboardContentProps {
  user: User
}

export default async function DashboardContent({ user }: DashboardContentProps) {
  const supabase = createServerClient()

  // Fetch dashboard data
  // Training modules - get required modules for user's site
  let requiredModulesRemaining = 0
  
  // Get required training courses (site-specific for user's site)
  let requiredCoursesQuery = supabase
    .from('training_courses')
    .select('id')
    .eq('active', true)
  
  if (user.site) {
    requiredCoursesQuery = requiredCoursesQuery.eq('site', user.site)
  } else {
    // User with no site - required modules are general ones (site = null)
    requiredCoursesQuery = requiredCoursesQuery.is('site', null)
  }
  
  const { data: requiredCourses } = await requiredCoursesQuery
  
  // Get user's completed courses (not expired)
  const { data: completions } = await supabase
    .from('training_completions')
    .select('courseId')
    .eq('userId', user.id)
    .gt('expiresAt', new Date().toISOString())
  
  const completedCourseIds = new Set(completions?.map(c => c.courseId) || [])
  
  // Count required modules that are not completed
  requiredModulesRemaining = requiredCourses?.filter(
    course => !completedCourseIds.has(course.id)
  ).length || 0

  // Pending holiday requests
  const { data: holidayRequests } = await supabase
    .from('holiday_requests')
    .select('*')
    .eq('userId', user.id)
    .eq('status', 'pending')
    .order('createdAt', { ascending: false })
    .limit(5)

  // Rejected holiday requests from the last 7 days only (dashboard); up to 3 most recent
  const rejectedSinceIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: rejectedRequests } = await supabase
    .from('holiday_requests')
    .select('*')
    .eq('userId', user.id)
    .eq('status', 'rejected')
    .gte('updatedAt', rejectedSinceIso)
    .order('updatedAt', { ascending: false })
    .limit(3)

  // Upcoming approved holidays - only for the current user
  const today = new Date().toISOString().split('T')[0]
  const { data: upcomingHolidays } = await supabase
    .from('holiday_requests')
    .select('*')
    .eq('userId', user.id)
    .eq('status', 'approved')
    .gte('endDate', today) // Only show holidays that haven't ended yet
    .order('startDate', { ascending: true })
    .limit(5)

  // Dashboard: pinned notices when present; otherwise latest active notices
  const noticeExpiryOr = 'expiresAt.is.null,expiresAt.gt.' + new Date().toISOString()
  const { data: pinnedForDashboard } = await supabase
    .from('notices')
    .select('*')
    .eq('pinned', true)
    .or(noticeExpiryOr)
    .order('createdAt', { ascending: false })
    .limit(6)

  let dashboardNotices = pinnedForDashboard ?? []
  if (dashboardNotices.length === 0) {
    const { data: recentNotices } = await supabase
      .from('notices')
      .select('*')
      .or(noticeExpiryOr)
      .order('createdAt', { ascending: false })
      .limit(3)
    dashboardNotices = recentNotices ?? []
  }

  // Most recently announced Employee of the Month winners (both picks, any month)
  const { data: recentWinnerRows } = await supabase
    .from('employee_winners')
    .select('id, userId, month, type, users(id, name, site)')
    .order('month', { ascending: false })
    .limit(4) // grab a small buffer in case months are partially announced

  const latestMonth = recentWinnerRows?.[0]?.month ?? null
  const eotmWinners = latestMonth
    ? (recentWinnerRows ?? []).filter(w => w.month === latestMonth)
    : []

  // Fetch vote reasons left for the winning nominees that month
  let eotmReasons: string[] = []
  if (latestMonth && eotmWinners.length > 0) {
    const winnerIds = eotmWinners.map(w => w.userId)
    const { data: reasonRows } = await supabase
      .from('employee_votes')
      .select('reason')
      .eq('month', latestMonth)
      .in('nomineeId', winnerIds)
      .not('reason', 'is', null)
    eotmReasons = (reasonRows ?? []).map((r: any) => r.reason).filter(Boolean)
  }

  // User's grievances (only their own)
  const { data: userGrievances } = await supabase
    .from('grievances')
    .select('*')
    .eq('userId', user.id)
    .order('createdAt', { ascending: false })
    .limit(5)

  // Next upcoming event
  let nextEvent = null
  try {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('upcoming_events')
      .select('*')
      .gte('eventDate', today)
      .order('eventDate', { ascending: true })
      .order('eventTime', { ascending: true, nullsFirst: false })
      .limit(1)
      .maybeSingle()
    
    if (!error && data) {
      nextEvent = data
    }
  } catch (error) {
    // Table might not exist yet, ignore error
    console.error('Error fetching next event:', error)
  }

  // Accepted upcoming meetings
  let acceptedMeetings: any[] = []
  try {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('meetings')
      .select(`
        *,
        requester:requested_by (
          id,
          name,
          site
        ),
        recipient:requested_for (
          id,
          name,
          site
        )
      `)
      .eq('status', 'accepted')
      .gte('meeting_date', today)
      .or(`requested_by.eq.${user.id},requested_for.eq.${user.id}`)
      .order('meeting_date', { ascending: true })
      .order('meeting_time', { ascending: true, nullsFirst: false })
      .limit(5)
    
    if (!error && data) {
      acceptedMeetings = (data || []).map((meeting: any) => {
        const requesterData = Array.isArray(meeting.requester) ? meeting.requester[0] : meeting.requester
        const recipientData = Array.isArray(meeting.recipient) ? meeting.recipient[0] : meeting.recipient
        
        return {
          id: meeting.id,
          title: meeting.title,
          description: meeting.description,
          requestedBy: requesterData ? {
            id: requesterData.id,
            name: requesterData.name,
            site: requesterData.site ?? null,
          } : null,
          requestedFor: recipientData ? {
            id: recipientData.id,
            name: recipientData.name,
            site: recipientData.site ?? null,
          } : null,
          status: meeting.status,
          meetingDate: meeting.meeting_date || meeting.meetingDate,
          meetingTime: meeting.meeting_time || meeting.meetingTime,
        }
      })
    }
  } catch (error) {
    // Table might not exist yet, ignore error
    console.error('Error fetching accepted meetings:', error)
  }

  return (
    <div className="w-full max-w-md sm:max-w-2xl lg:max-w-4xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-28 sm:pb-24 relative z-10">
      {/* Welcome Message */}
      <div className="mb-4 sm:mb-6 flex items-center justify-between">
        <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">Welcome back, {user.name}</p>
        <PushNotificationButton />
      </div>

      {/* Meeting Notification Card - Above Notices */}
      <div className="mb-4 sm:mb-6">
        <MeetingNotificationCard userId={user.id} />
      </div>

      {/* Notice highlights — one card per notice (full width, no outer wrapper) */}
      {dashboardNotices.length > 0 && (
        <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:gap-4">
          {dashboardNotices.map((n) => (
            <DashboardNoticeCard key={n.id} notice={n as Notice} />
          ))}
        </div>
      )}

      {/* Next Upcoming Event */}
      {nextEvent && (
        <div className="mb-4 sm:mb-6">
          <NextEventCard event={nextEvent as any} />
        </div>
      )}

      {/* Employees of the Month */}
      {eotmWinners.length > 0 && (
        <div className="mb-4 sm:mb-6">
          <EotmDashboardCard
            winners={eotmWinners as any}
            formattedMonth={formatVotingMonth(latestMonth!)}
            reasons={eotmReasons}
          />
        </div>
      )}

      {/* Accepted Meetings */}
      {acceptedMeetings.length > 0 && (
        <div className="mb-4 sm:mb-6">
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-foreground">Upcoming Meetings</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {acceptedMeetings.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                currentUserId={user.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Instagram Social Media Feed */}
      <div className="mb-4 sm:mb-6">
        <InstagramFeed />
      </div>

      {/* Quick Stats Grid */}
      {requiredModulesRemaining > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
          {/* Training Status */}
          <Card className="bg-[#1e1e1e]/60 backdrop-blur-md rounded-2xl border border-border/30 shadow-lg">
            <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-spirits-cyan flex-shrink-0" />
                <CardDescription className="text-xs sm:text-sm">Training</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="flex items-baseline gap-2 mb-2">
                <p className="text-2xl sm:text-3xl font-bold text-foreground">
                  {requiredModulesRemaining}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {requiredModulesRemaining === 1 ? 'module' : 'modules'} remaining
                </p>
              </div>
              <Link
                href="/training"
                className="text-xs text-spirits-cyan hover:text-spirits-cyan-dark inline-block transition-colors touch-manipulation"
              >
                Complete training →
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content - Single Column for Better Mobile Experience */}
      <div className="space-y-3 sm:space-y-4 lg:space-y-6">
        {/* Holidays Section */}
        {(holidayRequests && holidayRequests.length > 0) || (upcomingHolidays && upcomingHolidays.length > 0) || (rejectedRequests && rejectedRequests.length > 0) ? (
          <Card className="bg-[#1e1e1e]/60 backdrop-blur-md rounded-2xl border border-border/30 shadow-lg">
            <CardHeader className="p-3 sm:p-6">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-spirits-cyan flex-shrink-0" />
                  Holidays
                </CardTitle>
                <Link
                  href="/holidays"
                  className="text-xs text-spirits-cyan hover:text-spirits-cyan-dark font-semibold transition-all hover:underline touch-manipulation"
                >
                  View All →
                </Link>
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6 space-y-3 sm:space-y-4">
              {/* Pending Requests */}
              {holidayRequests && holidayRequests.length > 0 && (
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground mb-2">Pending Requests</h3>
                  <ul className="space-y-1.5 sm:space-y-2">
                    {holidayRequests.map((request: any) => (
                      <li key={request.id} className="flex justify-between items-center py-1.5 sm:py-2 border-b border-border/30 last:border-0">
                        <span className="text-xs sm:text-sm text-foreground flex-1 min-w-0 pr-2">
                          {formatDate(request.startDate)} - {formatDate(request.endDate)}
                        </span>
                        <span className="px-2 py-1 bg-spirits-yellow/20 text-spirits-yellow text-xs font-medium rounded border border-spirits-yellow/30 flex-shrink-0">
                          Pending
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Upcoming Holidays */}
              {upcomingHolidays && upcomingHolidays.length > 0 && (
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground mb-2">Upcoming</h3>
                  <ul className="space-y-1.5 sm:space-y-2">
                    {upcomingHolidays.map((holiday: any) => (
                      <li key={holiday.id} className="flex justify-between items-start sm:items-center py-1.5 sm:py-2 border-b border-border/30 last:border-0 gap-2">
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-xs sm:text-sm text-foreground font-medium">
                            {formatDate(holiday.startDate)} - {formatDate(holiday.endDate)}
                          </span>
                          {holiday.reason && (
                            <span className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                              {holiday.reason}
                            </span>
                          )}
                        </div>
                        <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs font-medium rounded border border-green-500/30 flex-shrink-0">
                          Approved
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Rejected Requests */}
              {rejectedRequests && rejectedRequests.length > 0 && (
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground mb-2">Recently Rejected</h3>
                  <ul className="space-y-1.5 sm:space-y-2">
                    {rejectedRequests.map((request: any) => (
                      <li key={request.id} className="py-1.5 sm:py-2 border-b border-border/30 last:border-0">
                        <div className="flex justify-between items-center mb-1 gap-2">
                          <span className="text-xs sm:text-sm text-foreground flex-1 min-w-0">
                            {formatDate(request.startDate)} - {formatDate(request.endDate)}
                          </span>
                          <span className="px-2 py-1 bg-red-500/20 text-red-500 text-xs font-medium rounded border border-red-500/30 flex-shrink-0">
                            Rejected
                          </span>
                        </div>
                        {request.rejectionReason && (
                          <p className="text-xs text-muted-foreground italic pl-2 border-l-2 border-red-500/30 mt-1 line-clamp-2">
                            {request.rejectionReason}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}


        {/* Grievances Section */}
        {userGrievances && userGrievances.length > 0 && (
          <Card className="bg-[#1e1e1e]/60 backdrop-blur-md rounded-2xl border border-border/30 shadow-lg">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-normal">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-garrison-orange flex-shrink-0" />
                Grievances
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <ul className="space-y-1.5 sm:space-y-2">
                {userGrievances.map((grievance: any) => (
                  <li key={grievance.id} className="flex justify-between items-center py-1.5 sm:py-2 border-b border-border/30 last:border-0 gap-2">
                    <span className="text-xs sm:text-sm text-foreground flex-1 min-w-0">
                      Submitted: {formatDate(grievance.createdAt)}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded border flex-shrink-0 ${
                      grievance.status === 'submitted' 
                        ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
                        : grievance.status === 'in_review'
                        ? 'bg-blue-500/20 text-blue-500 border-blue-500/30'
                        : 'bg-green-500/20 text-green-500 border-green-500/30'
                    }`}>
                      {grievance.status === 'submitted' ? 'Submitted' : grievance.status === 'in_review' ? 'In Review' : 'Resolved'}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Daily Check-In Streak - At Bottom */}
      <div className="mt-4 sm:mt-6 mb-4 sm:mb-6">
        <DailyCheckInCard />
      </div>

      {/* Footer with Logo */}
      <div className="mt-4 sm:mt-6 flex justify-center items-center pt-3 sm:pt-4 pb-6 sm:pb-8">
        <img 
          src="/logos/gtnslogo_text_wite.png"
          alt="Gaitens Leisure"
          className="h-12 sm:h-16 lg:h-20 w-auto opacity-60"
        />
      </div>

      {/* Unread Notices Modal - Waits for achievements to finish */}
      <UnreadNoticesModal waitForAchievements={true} />

      {/* Achievement Notification Manager */}
      <AchievementNotificationManager userId={user.id} />

      {/* Push Notification Manager */}
      <PushNotificationManager />
    </div>
  )
}
