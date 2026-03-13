import { requireAuth, getCurrentUser } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { GrievanceForm } from '@/components/grievance/GrievanceForm'
import { GrievancesList } from '@/components/grievance/GrievancesList'
import { PageHeader } from '@/components/layout/PageHeader'
import { FileText } from 'lucide-react'
import type { Grievance } from '@/types/database'

interface GrievanceWithUser extends Grievance {
  user: {
    id: string
    name: string
    site: string | null
  }
}

export default async function GrievancePage() {
  const user = await requireAuth()
  const supabase = createServerClient()

  // If admin, fetch grievances
  if (user.role === 'admin') {
    const { data: grievances } = await supabase
      .from('grievances')
      .select(`
        *,
        user:users!grievances_userId_fkey (
          id,
          name,
          site
        )
      `)
      .order('createdAt', { ascending: false })

    return (
      <div className="min-h-screen bg-background">
        <PageHeader 
          title="Grievances"
          icon={<FileText className="h-6 w-6 text-garrison-orange" />}
          description="Review and manage submitted grievances"
        />
        <div className="p-4 sm:p-6 lg:p-8 pb-32">
          <div className="max-w-4xl mx-auto">
            <GrievancesList initialGrievances={(grievances as GrievanceWithUser[]) || []} />
          </div>
        </div>
      </div>
    )
  }

  // If staff, show form
  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="File a Grievance"
        icon={<FileText className="h-6 w-6 text-garrison-orange" />}
        description="All grievances are kept confidential and handled professionally"
      />
      <div className="p-4 sm:p-6 lg:p-8 pb-32">
        <div className="max-w-4xl mx-auto">
          <GrievanceForm />
        </div>
      </div>
    </div>
  )
}
