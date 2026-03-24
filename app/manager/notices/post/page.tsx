import { requireManager } from '@/lib/auth'
import { PostNoticeForm } from '@/components/notices/PostNoticeForm'
import { PageHeader } from '@/components/layout/PageHeader'
import { FileText } from 'lucide-react'

export default async function PostNoticePage() {
  await requireManager()

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Post Notice"
        icon={<FileText className="h-6 w-6 text-spirits-yellow" />}
        description="Share updates with staff — cancel or post from the dock"
        showBack={true}
        backHref="/dashboard"
      />
      <div className="p-4 sm:p-6 lg:p-8 pb-32">
        <div className="max-w-5xl mx-auto">
          <PostNoticeForm />
        </div>
      </div>
    </div>
  )
}
