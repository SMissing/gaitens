import type { SupabaseClient } from '@supabase/supabase-js'
import type { Achievement, UserAchievement } from '@/types/database'

async function sendPushNotification(
  userId: string,
  achievementName: string,
  achievementDescription: string,
) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const notificationPayload = {
      title: 'Achievement Unlocked! 🎉',
      body: `${achievementName}: ${achievementDescription}`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'achievement',
      data: {
        url: '/achievements',
        type: 'achievement',
        achievementName,
      },
    }

    await fetch(`${baseUrl}/api/push/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        ...notificationPayload,
        internalSecret: process.env.INTERNAL_API_SECRET || 'internal-secret-change-in-production',
      }),
    }).catch((err) => console.error('Failed to send push notification:', err))
  } catch (error) {
    console.error('Error in sendPushNotification:', error)
  }
}

type AwardResult =
  | { ok: true; userAchievement: UserAchievement }
  | { ok: false; error: string; status: number }

/**
 * Award an achievement to a user (same rules as POST /api/achievements/award).
 * Used by the award API and by badge-request approval.
 */
export async function awardAchievementToUser(
  supabase: SupabaseClient,
  managerUserId: string,
  targetUserId: string,
  achievementId: string,
): Promise<AwardResult> {
  const { data: achievement, error: achievementError } = await supabase
    .from('achievements')
    .select('*')
    .eq('id', achievementId)
    .single()

  if (achievementError || !achievement) {
    return { ok: false, error: 'Achievement not found', status: 404 }
  }

  const ach = achievement as Achievement

  const { data: existing, error: existingError } = await supabase
    .from('user_achievements')
    .select('*')
    .eq('userId', targetUserId)
    .eq('achievementId', achievementId)
    .single()

  if (existingError && existingError.code !== 'PGRST116') {
    console.error('Error checking existing achievement:', existingError)
    return { ok: false, error: 'Failed to check existing achievement', status: 500 }
  }

  if (existing) {
    if (ach.requiresProgress && !existing.completed) {
      const newProgress = existing.currentProgress + 1
      const isCompleted = newProgress >= ach.requiredCount

      const { data: updated, error: updateError } = await supabase
        .from('user_achievements')
        .update({
          currentProgress: newProgress,
          completed: isCompleted,
          awardedBy: managerUserId,
          awardedAt: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating achievement progress:', updateError)
        return { ok: false, error: 'Failed to update achievement progress', status: 500 }
      }

      sendPushNotification(
        targetUserId,
        ach.name,
        ach.description || 'Progress updated!',
      ).catch((err) => console.error('Failed to send push notification:', err))

      return { ok: true, userAchievement: updated as UserAchievement }
    }
    return { ok: false, error: 'Achievement already completed', status: 400 }
  }

  const isCompleted = !ach.requiresProgress || ach.requiredCount === 1

  const { data: newAchievement, error: insertError } = await supabase
    .from('user_achievements')
    .insert({
      userId: targetUserId,
      achievementId,
      currentProgress: 1,
      completed: isCompleted,
      awardedBy: managerUserId,
    })
    .select()
    .single()

  if (insertError) {
    console.error('Error awarding achievement:', insertError)
    return { ok: false, error: 'Failed to award achievement', status: 500 }
  }

  sendPushNotification(
    targetUserId,
    ach.name,
    ach.description || 'Achievement unlocked!',
  ).catch((err) => console.error('Failed to send push notification:', err))

  return { ok: true, userAchievement: newAchievement as UserAchievement }
}
