import { requireAuth } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { PostItNote } from '@/components/notices/PostItNote'
import type { Notice } from '@/types/database'
import { FileText } from 'lucide-react'
import { NoticesClient } from '@/components/notices/NoticesClient'

export default async function NoticesPage() {
  await requireAuth()
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
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 pb-48 sm:pb-40">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-spirits-cyan/20 rounded-lg border border-spirits-cyan/50">
              <FileText className="h-6 w-6 text-spirits-cyan" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Notice Board</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            All staff notices and announcements
          </p>
        </div>

        {/* Post-it Notes Grid */}
        <NoticesClient notices={noticesWithStyles} />
      </div>
    </div>
  )
}
