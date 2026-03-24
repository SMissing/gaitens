import { requireManager } from '@/lib/auth'
import { PageHeader } from '@/components/layout/PageHeader'
import { Calendar } from 'lucide-react'
import { MeetingsClient } from '@/components/meetings/MeetingsClient'

export default async function MeetingsPage() {
  const user = await requireManager()

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Meetings"
        icon={<Calendar className="h-6 w-6 text-spirits-yellow" />}
        description="Schedule and manage meetings — use the dock to add or refresh"
        showBack={true}
        backHref="/dashboard"
      />
      <div className="p-4 sm:p-6 lg:p-8 pb-32">
        <div className="max-w-5xl mx-auto">
          <MeetingsClient currentUserId={user.id} />
        </div>
      </div>
    </div>
  )
}
