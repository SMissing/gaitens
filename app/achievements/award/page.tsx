import { requireManager } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { PageHeader } from '@/components/layout/PageHeader'
import { AwardAchievementForm } from '@/components/achievements/AwardAchievementForm'
import { Award } from 'lucide-react'
import type { Achievement, User } from '@/types/database'

export default async function AwardAchievementPage() {
  await requireManager() // Only managers and admins can award
  const supabase = createServerClient()

  // Fetch all achievements
  // Order by requiredCount first (for streak badges: 1, 7, 30, 100), then by name
  const { data: achievements, error: achievementsError } = await supabase
    .from('achievements')
    .select('*')
    .order('requiredCount', { ascending: true, nullsFirst: false })
    .order('name', { ascending: true })

  if (achievementsError) {
    console.error('Error fetching achievements:', achievementsError)
  }

  // Fetch all active users
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, name, staffCode')
    .eq('active', true)
    .order('name', { ascending: true })

  if (usersError) {
    console.error('Error fetching users:', usersError)
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Award Achievement"
        icon={<Award className="h-6 w-6 text-spirits-cyan" />}
        description="Award an achievement to a staff member"
        showBack={true}
        backHref="/achievements"
      />
      <div className="p-4 sm:p-6 lg:p-8 pb-32">
        <div className="max-w-2xl mx-auto">
          <AwardAchievementForm 
            achievements={achievements as Achievement[] || []}
            users={users as User[] || []}
          />
        </div>
      </div>
    </div>
  )
}
