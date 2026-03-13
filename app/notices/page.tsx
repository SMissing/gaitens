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

  // Generate rotations and colors for each notice
  const noticesWithStyles = (notices || []).map((notice: Notice, index: number) => {
    const colors: ('yellow' | 'magenta' | 'cyan')[] = ['yellow', 'magenta', 'cyan']
    const color = colors[index % 3] // Cycle through colors
    const rotation = (index % 5 - 2) * 2 // Rotate between -4 and 4 degrees
    
    return {
      notice,
      color,
      rotation,
    }
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
