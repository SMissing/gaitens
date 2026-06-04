import { requireAuth, getCurrentUser } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { GrievanceForm } from '@/components/grievance/GrievanceForm'
import { GrievancesList } from '@/components/grievance/GrievancesList'
import { GrievanceDecision } from '@/components/grievance/GrievanceDecision'
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

export default async function GrievancePage({
  searchParams,
}: {
  searchParams: { confirmed?: string }
}) {
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

  // If staff and not yet confirmed the decision screen, show it first
  if (searchParams.confirmed !== 'true') {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader
          title="Raise a Concern"
          icon={<FileText className="h-6 w-6 text-garrison-orange" />}
          showBack
          backHref="/dashboard"
        />
        <div className="p-4 sm:p-6 lg:p-8 pb-32">
          <div className="max-w-lg mx-auto">
            <GrievanceDecision />
          </div>
        </div>
      </div>
    )
  }

  // Staff — show the form
  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="File a Grievance"
        icon={<FileText className="h-6 w-6 text-garrison-orange" />}
        description="All grievances are kept confidential and handled professionally"
        showBack
        backHref="/grievance"
      />
      <div className="p-4 sm:p-6 lg:p-8 pb-32">
        <div className="max-w-4xl mx-auto">
          <GrievanceForm />
        </div>
      </div>
    </div>
  )
}
