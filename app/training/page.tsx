import { requireAuth } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { TrainingContentClient } from '@/components/training/TrainingContentClient'
import { PageHeader } from '@/components/layout/PageHeader'
import { GraduationCap } from 'lucide-react'

export default async function TrainingPage() {
  const user = await requireAuth()

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="Training Centre"
        icon={<GraduationCap className="h-6 w-6 text-spirits-cyan" />}
        description="Complete your required training modules and explore additional resources"
      />
      <div className="p-4 sm:p-6 lg:p-8 pb-32">
        <div className="max-w-7xl mx-auto">
          <TrainingContentClient userSite={user.site} />
        </div>
      </div>
    </div>
  )
}
