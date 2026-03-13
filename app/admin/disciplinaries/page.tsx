import { requireAdmin } from '@/lib/auth'
import { DisciplinariesList } from '@/components/disciplinaries/DisciplinariesList'
import { PageHeader } from '@/components/layout/PageHeader'
import { Gavel } from 'lucide-react'

export default async function DisciplinariesPage() {
  await requireAdmin()

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="Disciplinaries"
        icon={<Gavel className="h-6 w-6 text-red-500" />}
        description="Manage staff disciplinaries. Each staff member starts with 3 hearts."
      />
      <div className="p-4 sm:p-6 lg:p-8 pb-32">
        <div className="max-w-4xl mx-auto">
          <DisciplinariesList />
        </div>
      </div>
    </div>
  )
}
