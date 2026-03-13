import { requireAuth } from '@/lib/auth'
import { PageHeader } from '@/components/layout/PageHeader'
import { Building2 } from 'lucide-react'

export default async function BusinessesPage() {
  await requireAuth()

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="Business Information"
        icon={<Building2 className="h-6 w-6 text-spirits-cyan" />}
        description="Learn about our businesses"
      />
      <div className="p-4 sm:p-6 lg:p-8 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="bg-card/80 backdrop-blur-md rounded-lg border border-border/50 p-6">
            <p className="text-muted-foreground">Business information pages coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
