import { requireAuth } from '@/lib/auth'
import { HolidaysClient } from '@/components/holidays/HolidaysClient'
import { PageHeader } from '@/components/layout/PageHeader'
import { Calendar } from 'lucide-react'

export default async function HolidaysPage() {
  const user = await requireAuth()

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="Holidays"
        icon={<Calendar className="h-6 w-6 text-spirits-cyan" />}
        description="Request time off and manage your holidays"
      />
      <HolidaysClient userRole={user.role} />
    </div>
  )
}
