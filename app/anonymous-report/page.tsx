import { requireAuth } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { AnonymousReportForm } from '@/components/anonymous-reports/AnonymousReportForm'
import { AnonymousReportsList } from '@/components/anonymous-reports/AnonymousReportsList'
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

export default async function AnonymousReportPage() {
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

  // If staff, show form
  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="Anonymous Report"
        icon={<FileText className="h-6 w-6 text-garrison-orange" />}
        description="Submit a confidential anonymous report to administrators"
      />
      <div className="p-4 sm:p-6 lg:p-8 pb-32">
        <div className="max-w-4xl mx-auto">
          <AnonymousReportForm />
        </div>
      </div>
    </div>
  )
}
