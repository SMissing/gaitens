import { requireAuth, getCurrentUser } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { PostItNote } from '@/components/notices/PostItNote'
import { PageHeader } from '@/components/layout/PageHeader'
import type { Notice } from '@/types/database'
import { FileText } from 'lucide-react'
import { NoticesClient } from '@/components/notices/NoticesClient'

export default async function NoticesPage() {
  const user = await requireAuth()
  const supabase = createServerClient()

  // Fetch all active notices
  const { data: notices } = await supabase
    .from('notices')
    .select('*')
    .or('expiresAt.is.null,expiresAt.gt.' + new Date().toISOString())
    .order('pinned', { ascending: false })
    .order('createdAt', { ascending: false })

  // Assign semantic colours: pinned = cyan (informational), regular cycle yellow/magenta
  let regularIndex = 0
  const noticesWithStyles = (notices || []).map((notice: Notice, index: number) => {
    let color: 'yellow' | 'magenta' | 'cyan'
    if (notice.pinned) {
      color = 'cyan'
    } else {
      color = regularIndex % 2 === 0 ? 'yellow' : 'magenta'
      regularIndex++
    }
    const rotation = (index % 5 - 2) * 2
    return { notice, color, rotation }
  })

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="Notice Board"
        icon={<FileText className="h-6 w-6 text-spirits-cyan" />}
        description="All staff notices and announcements"
      />
      <div className="p-4 sm:p-6 lg:p-8 pb-32">
        <div className="max-w-7xl mx-auto">
          <NoticesClient notices={noticesWithStyles} userRole={user.role} />
        </div>
      </div>
    </div>
  )
}
