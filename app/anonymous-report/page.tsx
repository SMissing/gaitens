import { requireAuth } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { AnonymousReportForm } from '@/components/anonymous-reports/AnonymousReportForm'
import { AnonymousReportsList } from '@/components/anonymous-reports/AnonymousReportsList'
import { GrievanceDecision } from '@/components/grievance/GrievanceDecision'
import { PageHeader } from '@/components/layout/PageHeader'
import { FileText } from 'lucide-react'

interface AnonymousReport {
  id: string
  note: string
  reportDate: string
  status: 'submitted' | 'in_review' | 'resolved'
  createdAt: string
  updatedAt: string
}

export default async function AnonymousReportPage({
  searchParams,
}: {
  searchParams: { confirmed?: string }
}) {
  const user = await requireAuth()
  const supabase = createServerClient()

  // If admin, fetch reports
  if (user.role === 'admin') {
    const { data: reports } = await supabase
      .from('anonymous_reports')
      .select('*')
      .order('createdAt', { ascending: false })

    return (
      <div className="min-h-screen bg-background">
        <PageHeader 
          title="Anonymous Reports"
          icon={<FileText className="h-6 w-6 text-garrison-orange" />}
          description="Review and manage anonymous reports"
        />
        <div className="p-4 sm:p-6 lg:p-8 pb-32">
          <div className="max-w-4xl mx-auto">
            <AnonymousReportsList initialReports={(reports as AnonymousReport[]) || []} />
          </div>
        </div>
      </div>
    )
  }

  // If staff and not yet through the decision screen, show it first
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
        title="Anonymous Report"
        icon={<FileText className="h-6 w-6 text-garrison-orange" />}
        description="Submit a confidential anonymous report to administrators"
        showBack
        backHref="/anonymous-report"
      />
      <div className="p-4 sm:p-6 lg:p-8 pb-32">
        <div className="max-w-4xl mx-auto">
          <AnonymousReportForm />
        </div>
      </div>
    </div>
  )
}
