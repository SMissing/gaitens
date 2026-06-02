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
import { NextEventCard } from '@/components/upcoming-events/NextEventCard'
import { EotmDashboardCard } from './EotmDashboardCard'
import { MeetingNotificationCard } from '@/components/meetings/MeetingNotificationCard'
import { MeetingCard } from '@/components/meetings/MeetingCard'
import { DailyCheckInChip } from '@/components/streaks/DailyCheckInChip'
import { DashboardTrainingBar } from '@/components/training/DashboardTrainingBar'
import {
  Calendar,
  FileText,
  ChevronRight,
} from 'lucide-react'

interface DashboardContentProps {
  user: User
}

export default async function DashboardContent({ user }: DashboardContentProps) {
  const supabase = createServerClient()

  // Training progress is handled client-side by DashboardTrainingBar (uses /api/training
  // which has correct session context; direct Supabase queries from server components
  // use an unauthenticated client that can't read RLS-protected training_completions).
  // We keep a lightweight server-side course count only to drive hasActionRequired.
  let trainingQuery = supabase
    .from('training_courses')
    .select('id')
    .eq('active', true)

  if (user.site) {
    trainingQuery = trainingQuery.or(`site.is.null,site.eq.${user.site}`)
  } else {
    trainingQuery = trainingQuery.is('site', null)
  }

  const { data: trainingCourses } = await trainingQuery
  const remainingCount = trainingCourses?.length || 0

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
    .gte('endDate', today)
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
    .limit(4)

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
    const todayStr = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('upcoming_events')
      .select('*')
      .gte('eventDate', todayStr)
      .order('eventDate', { ascending: true })
      .order('eventTime', { ascending: true, nullsFirst: false })
      .limit(1)
      .maybeSingle()

    if (!error && data) {
      nextEvent = data
    }
  } catch (error) {
    console.error('Error fetching next event:', error)
  }

  // Accepted upcoming meetings
  let acceptedMeetings: any[] = []
  try {
    const todayStr = new Date().toISOString().split('T')[0]
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
      .gte('meeting_date', todayStr)
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
    console.error('Error fetching accepted meetings:', error)
  }

  const hasActionRequired =
    remainingCount > 0 ||
    (rejectedRequests?.length ?? 0) > 0 ||
    (holidayRequests?.length ?? 0) > 0

  const hasWhatsOn =
    dashboardNotices.length > 0 ||
    nextEvent !== null ||
    acceptedMeetings.length > 0

  return (
    <div className="w-full max-w-md sm:max-w-2xl lg:max-w-4xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-28 sm:pb-24 relative z-10">
      {/* Welcome Message */}
      <div className="mb-4 sm:mb-6 flex items-center justify-between">
        <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">Welcome back, {user.name}</p>
        <DailyCheckInChip />
      </div>

      {/* Meeting Notification Card — pending invitations needing a response */}
      <div className="mb-3 sm:mb-4">
        <MeetingNotificationCard userId={user.id} />
      </div>

      {/* Action Required Zone — urgency items only */}
      {hasActionRequired && (
        <div className="mb-4 sm:mb-6 rounded-xl border-l-2 border-spirits-yellow/60 bg-spirits-yellow/5 px-4 py-3 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-spirits-yellow/80">
            Action Required
          </p>

          {/* Training progress — client component so it can read completions with a real session */}
          <DashboardTrainingBar />

          {/* Pending holiday requests — summary link */}
          {holidayRequests && holidayRequests.length > 0 && (
            <Link href="/holidays" className="flex items-center justify-between group">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-spirits-yellow flex-shrink-0" />
                <span className="text-sm font-medium text-foreground">
                  {holidayRequests.length} pending holiday {holidayRequests.length === 1 ? 'request' : 'requests'}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-spirits-yellow opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </Link>
          )}

          {/* Rejected holidays — shown inline because they're urgent */}
          {rejectedRequests && rejectedRequests.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-red-500 flex-shrink-0" />
                <span className="text-sm font-medium text-foreground">Recently Rejected</span>
              </div>
              <ul className="space-y-1.5">
                {rejectedRequests.map((request: any) => (
                  <li key={request.id} className="pl-6">
                    <div className="flex justify-between items-center gap-2 mb-0.5">
                      <span className="text-xs text-foreground">
                        {formatDate(request.startDate)} – {formatDate(request.endDate)}
                      </span>
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-500 text-xs font-medium rounded border border-red-500/30 flex-shrink-0">
                        Rejected
                      </span>
                    </div>
                    {request.rejectionReason && (
                      <p className="text-xs text-muted-foreground italic border-l-2 border-red-500/30 pl-2 line-clamp-2">
                        {request.rejectionReason}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* What's On — notices, events, confirmed meetings */}
      {hasWhatsOn && (
        <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            What's On
          </p>

          {/* Notice highlights */}
          {dashboardNotices.length > 0 && (
            <div className="flex flex-col gap-3">
              {dashboardNotices.map((n) => (
                <DashboardNoticeCard key={n.id} notice={n as Notice} />
              ))}
            </div>
          )}

          {/* Next upcoming event */}
          {nextEvent && (
            <NextEventCard event={nextEvent as any} />
          )}

          {/* Accepted upcoming meetings */}
          {acceptedMeetings.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground mb-2">Upcoming Meetings</h2>
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
        </div>
      )}

      {/* Upcoming approved holidays — informational summary */}
      {upcomingHolidays && upcomingHolidays.length > 0 && (
        <div className="mb-4 sm:mb-6">
          <Link
            href="/holidays/upcoming"
            className="flex items-center justify-between group px-4 py-3 rounded-xl bg-[#1e1e1e]/60 backdrop-blur-md border border-border/30 transition-colors hover:border-border/50 touch-manipulation"
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-sm font-medium text-foreground">
                {upcomingHolidays.length} upcoming approved {upcomingHolidays.length === 1 ? 'holiday' : 'holidays'}
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </Link>
        </div>
      )}

      {/* Grievances — compact status summary */}
      {userGrievances && userGrievances.length > 0 && (
        <div className="mb-4 sm:mb-6">
          <Card className="bg-[#1e1e1e]/60 backdrop-blur-md rounded-2xl border border-border/30 shadow-lg">
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base font-normal">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-garrison-orange flex-shrink-0" />
                Grievances
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
              <ul className="space-y-1.5">
                {userGrievances.map((grievance: any) => (
                  <li key={grievance.id} className="flex justify-between items-center py-1.5 border-b border-border/30 last:border-0 gap-2">
                    <span className="text-xs sm:text-sm text-foreground flex-1 min-w-0">
                      Submitted: {formatDate(grievance.createdAt)}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded border flex-shrink-0 ${
                      grievance.status === 'submitted'
                        ? 'bg-spirits-yellow/20 text-spirits-yellow border-spirits-yellow/30'
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
        </div>
      )}

      {/* Community — celebratory content at the bottom */}
      {eotmWinners.length > 0 && (
        <div className="mb-4 sm:mb-6">
          <EotmDashboardCard
            winners={eotmWinners as any}
            formattedMonth={formatVotingMonth(latestMonth!)}
            reasons={eotmReasons}
          />
        </div>
      )}

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
