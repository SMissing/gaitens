import { requireManager } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { PageHeader } from '@/components/layout/PageHeader'
import { BarredListClient } from '@/components/barred/BarredListClient'
import { Ban } from 'lucide-react'

export default async function BarredListPage() {
  await requireManager()

  const supabase = createServerClient()

  let initialPeople: any[] = []
  try {
    const { data, error } = await supabase
      .from('barred_people')
      .select(
        'id, name, imageUrl, reason, barDurationValue, barDurationUnit, barEndDate, createdAt'
      )
      .order('createdAt', { ascending: false })

    if (!error && Array.isArray(data)) {
      initialPeople = data
    } else if (error) {
      console.error('Error fetching barred people:', error)
    }
  } catch (err) {
    console.error('Error fetching barred people:', err)
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Barred List"
        icon={<Ban className="h-6 w-6 text-spirits-magenta" />}
        description="Manage barred people (photo + reason + bar length)"
        showBack={true}
        backHref="/dashboard"
      />
      <div className="p-4 sm:p-6 lg:p-8 pb-32">
        <div className="max-w-5xl mx-auto">
          <BarredListClient initialPeople={initialPeople as any} />
        </div>
      </div>
    </div>
  )
}

