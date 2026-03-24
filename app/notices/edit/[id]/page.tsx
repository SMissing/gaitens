import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { PostNoticeForm } from '@/components/notices/PostNoticeForm'
import { PageHeader } from '@/components/layout/PageHeader'
import { FileText } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function EditNoticePage({
  params,
}: {
  params: { id: string }
}) {
  await requireAdmin()
  const supabase = createServerClient()

  // Fetch the notice
  const { data: notice, error } = await supabase
    .from('notices')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !notice) {
    redirect('/notices')
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Edit Notice"
        icon={<FileText className="h-6 w-6 text-spirits-yellow" />}
        description="Update what staff see — cancel or save from the dock"
        showBack={true}
        backHref="/notices"
      />
      <div className="p-4 sm:p-6 lg:p-8 pb-32">
        <div className="max-w-5xl mx-auto">
          <PostNoticeForm notice={notice} />
        </div>
      </div>
    </div>
  )
}
