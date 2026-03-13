import { getCurrentUser } from '@/lib/auth'
import { AchievementNotificationManager } from './AchievementNotificationManager'

export async function GlobalAchievementNotification() {
  const user = await getCurrentUser()
  
  // Don't show on login page or if not authenticated
  if (!user) {
    return null
  }

  return <AchievementNotificationManager userId={user.id} />
}
