import { requireAuth } from '@/lib/auth'
import { isAppFeedbackITUser } from '@/lib/app-feedback-config'
import AppFeedbackPageClient from './AppFeedbackPageClient'

export default async function AppFeedbackPage() {
  const user = await requireAuth()
  return (
    <AppFeedbackPageClient canReplyAsIT={isAppFeedbackITUser(user.staffCode)} />
  )
}
