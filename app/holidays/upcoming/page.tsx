import Link from 'next/link'
import { requireAuth } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { formatDate } from '@/lib/date-utils'
import { PageHeader } from '@/components/layout/PageHeader'
import { Calendar } from 'lucide-react'

function daysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
}

export default async function UpcomingHolidaysPage() {
  const user = await requireAuth()
  const supabase = createServerClient()

  const today = new Date().toISOString().split('T')[0]
  const { data: upcomingHolidays } = await supabase
    .from('holiday_requests')
    .select('*')
    .eq('userId', user.id)
    .eq('status', 'approved')
    .gte('endDate', today)
    .order('startDate', { ascending: true })

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Upcoming Holidays"
        icon={<Calendar className="h-6 w-6 text-green-500" />}
        description="Your approved time off"
        showBack
        backHref="/dashboard"
      />

      <div className="w-full max-w-md sm:max-w-2xl lg:max-w-4xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-28">
        <div className="flex justify-end mb-4">
          <Link
            href="/holidays"
            className="text-xs text-spirits-cyan hover:text-spirits-cyanDark transition-colors"
          >
            Manage all holidays →
          </Link>
        </div>

        {upcomingHolidays && upcomingHolidays.length > 0 ? (
          <div className="space-y-3">
            {upcomingHolidays.map((holiday: any) => {
              const days = daysBetween(holiday.startDate, holiday.endDate)
              return (
                <div
                  key={holiday.id}
                  className="rounded-xl bg-[#1e1e1e]/60 backdrop-blur-md border border-border/30 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {formatDate(holiday.startDate)} – {formatDate(holiday.endDate)}
                      </p>
                      {holiday.reason && (
                        <p className="text-xs text-muted-foreground mt-0.5">{holiday.reason}</p>
                      )}
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-end gap-1">
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-500 text-xs font-medium rounded border border-green-500/30">
                        Approved
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {days} {days === 1 ? 'day' : 'days'}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <Calendar className="h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No upcoming approved holidays.</p>
            <Link
              href="/holidays"
              className="text-xs text-spirits-cyan hover:text-spirits-cyanDark transition-colors"
            >
              Request time off →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
