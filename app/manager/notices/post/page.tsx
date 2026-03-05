import { requireManager } from '@/lib/auth'
import { PostNoticeForm } from '@/components/notices/PostNoticeForm'

export default async function PostNoticePage() {
  await requireManager()

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <PostNoticeForm />
      </div>
    </div>
  )
}
