import { requireAuth } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { getCurrentVotingMonth } from '@/lib/date-utils'
import { VotingCard } from '@/components/employee-of-the-month/VotingCard'
import { AdminVoteStats } from '@/components/employee-of-the-month/AdminVoteStats'
import { WinnerDisplay } from '@/components/employee-of-the-month/WinnerDisplay'
import { PageHeader } from '@/components/layout/PageHeader'
import { Award, Calendar } from 'lucide-react'

export default async function EmployeeOfTheMonthPage() {
  const user = await requireAuth()
  const supabase = createServerClient()
  const currentMonth = getCurrentVotingMonth()

  // Get current user's vote for this month
  const { data: currentVote } = await supabase
    .from('employee_votes')
    .select(`
      *,
      users:nomineeId(id, name, staffCode)
    `)
    .eq('voterId', user.id)
    .eq('month', currentMonth)
    .single()

  // Get current month's winners
  const { data: winners } = await supabase
    .from('employee_winners')
    .select(`
      *,
      users(id, name, staffCode)
    `)
    .eq('month', currentMonth)

  const staffWinner = winners?.find(w => w.type === 'staff_pick')
  const managerWinner = winners?.find(w => w.type === 'manager_pick')


  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="Employee of the Month"
        icon={<Award className="h-6 w-6 text-spirits-yellow" />}
        description={`Voting Period: ${currentMonth}`}
      />
      <div className="p-4 sm:p-6 lg:p-8 pb-32">
        <div className="max-w-7xl mx-auto">

        {/* Current Winners - Certificate Display */}
        {(staffWinner || managerWinner) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {staffWinner && (
              <WinnerDisplay 
                winner={staffWinner as any} 
                type="staff_pick" 
              />
            )}
            {managerWinner && (
              <WinnerDisplay 
                winner={managerWinner as any} 
                type="manager_pick" 
              />
            )}
          </div>
        )}

        {/* Admin View - Vote Statistics */}
        {user.role === 'admin' && (
          <div className="mb-8">
            <AdminVoteStats />
          </div>
        )}

        {/* Staff/Manager View - Voting Card */}
        {(user.role === 'staff' || user.role === 'manager') && (
          <VotingCard
            userRole={user.role}
            currentVote={currentVote || null}
            currentUserId={user.id}
          />
        )}
        </div>
      </div>
    </div>
  )
}
