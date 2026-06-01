import { requireAuth } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { getCurrentVotingMonth, formatVotingMonth } from '@/lib/date-utils'
import { VotingCard } from '@/components/employee-of-the-month/VotingCard'
import { WinnerDisplay } from '@/components/employee-of-the-month/WinnerDisplay'
import { PageHeader } from '@/components/layout/PageHeader'
import { Award, Trophy, CheckCircle, GraduationCap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default async function EmployeeOfTheMonthPage() {
  const user = await requireAuth()
  const supabase = createServerClient()
  const currentMonth = getCurrentVotingMonth()

  // Get current user's vote for this month
  const { data: currentVote } = await supabase
    .from('employee_votes')
    .select(`
      *,
      users:nomineeId(id, name, site)
    `)
    .eq('voterId', user.id)
    .eq('month', currentMonth)
    .single()

  // Get current month's winners
  const { data: winners } = await supabase
    .from('employee_winners')
    .select(`
      *,
      users(id, name, site)
    `)
    .eq('month', currentMonth)

  const staffWinner = winners?.find(w => w.type === 'staff_pick')
  const managerWinner = winners?.find(w => w.type === 'manager_pick')


  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Employee of the Month"
        icon={<Award className="h-6 w-6 text-spirits-yellow" />}
        description={`Voting Period: ${formatVotingMonth(currentMonth)}`}
      />
      <div className="p-4 sm:p-6 lg:p-8 pb-32">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Current Winners - Certificate Display */}
          {(staffWinner || managerWinner) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {staffWinner && (
                <WinnerDisplay winner={staffWinner as any} type="staff_pick" />
              )}
              {managerWinner && (
                <WinnerDisplay winner={managerWinner as any} type="manager_pick" />
              )}
            </div>
          )}

          {/* How it works */}
          <Card className="border" style={{ borderColor: 'var(--spirits-yellow)' }}>
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-4 w-4 text-spirits-yellow" />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-spirits-yellow">How it works</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Trophy className="h-4 w-4 text-spirits-yellow mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground">
                    Every month, <span className="font-semibold">2 members of staff</span> are awarded Employee of the Month and receive <span className="font-semibold">£100 each</span>.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground">
                    To be eligible to win, you must have <span className="font-semibold">voted for someone</span> this month.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <GraduationCap className="h-4 w-4 text-spirits-cyan mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground">
                    You must also have completed at least <span className="font-semibold">70% of your training</span> on the Gaitens portal.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Voting */}
          <VotingCard
            userRole={user.role}
            currentVote={currentVote || null}
            currentUserId={user.id}
          />

        </div>
      </div>
    </div>
  )
}
