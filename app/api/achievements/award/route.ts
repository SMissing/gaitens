import { NextRequest, NextResponse } from 'next/server'
import { requireManager } from '@/lib/auth'
import { createServerClient } from '@/lib/db'

// Helper function to send push notification
async function sendPushNotification(userId: string, achievementName: string, achievementDescription: string) {
  try {
    const supabase = createServerClient()
    
    // Get user's push subscriptions
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('userId', userId)

    if (!subscriptions || subscriptions.length === 0) {
      return // No subscriptions, skip
    }

    // Send notification to each subscription
    // Note: For production, install web-push and use VAPID keys
    // For now, this will work for in-app notifications via service worker
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

    // Send via internal API endpoint
    // This triggers the service worker to show the notification
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    await fetch(`${baseUrl}/api/push/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        ...notificationPayload,
        internalSecret: process.env.INTERNAL_API_SECRET || 'internal-secret-change-in-production',
      }),
    }).catch(err => {
      // Silently fail - notification sending is non-critical
      console.error('Failed to send push notification:', err)
    })
  } catch (error) {
    // Silently fail - notification sending is non-critical
    console.error('Error in sendPushNotification:', error)
  }
}

// POST - Award an achievement to a user
export async function POST(request: NextRequest) {
  try {
    const user = await requireManager() // Only managers and admins can award
    const supabase = createServerClient()
    
    const body = await request.json()
    const { userId, achievementId } = body

    if (!userId || !achievementId) {
      return NextResponse.json(
        { error: 'userId and achievementId are required' },
        { status: 400 }
      )
    }

    // Get the achievement to check if it requires progress
    const { data: achievement, error: achievementError } = await supabase
      .from('achievements')
      .select('*')
      .eq('id', achievementId)
      .single()

    if (achievementError || !achievement) {
      return NextResponse.json(
        { error: 'Achievement not found' },
        { status: 404 }
      )
    }

    // Check if user already has this achievement
    const { data: existing, error: existingError } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('userId', userId)
      .eq('achievementId', achievementId)
      .single()

    if (existingError && existingError.code !== 'PGRST116') {
      console.error('Error checking existing achievement:', existingError)
      return NextResponse.json(
        { error: 'Failed to check existing achievement' },
        { status: 500 }
      )
    }

    if (existing) {
      // Update progress if it's a progress-based achievement
      if (achievement.requiresProgress && !existing.completed) {
        const newProgress = existing.currentProgress + 1
        const isCompleted = newProgress >= achievement.requiredCount

        const { data: updated, error: updateError } = await supabase
          .from('user_achievements')
          .update({
            currentProgress: newProgress,
            completed: isCompleted,
            awardedBy: user.id,
            awardedAt: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single()

        if (updateError) {
          console.error('Error updating achievement progress:', updateError)
          return NextResponse.json(
            { error: 'Failed to update achievement progress' },
            { status: 500 }
          )
        }

        // Send push notification (non-blocking)
        sendPushNotification(userId, achievement.name, achievement.description || 'Progress updated!').catch(err => {
          console.error('Failed to send push notification:', err)
        })

        return NextResponse.json({ achievement: updated })
      } else {
        // Already completed or not progress-based
        return NextResponse.json(
          { error: 'Achievement already completed' },
          { status: 400 }
        )
      }
    } else {
      // Create new achievement
      const isCompleted = !achievement.requiresProgress || achievement.requiredCount === 1

      const { data: newAchievement, error: insertError } = await supabase
        .from('user_achievements')
        .insert({
          userId,
          achievementId,
          currentProgress: 1,
          completed: isCompleted,
          awardedBy: user.id,
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error awarding achievement:', insertError)
        return NextResponse.json(
          { error: 'Failed to award achievement' },
          { status: 500 }
        )
      }

      // Send push notification (non-blocking)
      sendPushNotification(userId, achievement.name, achievement.description || 'Achievement unlocked!').catch(err => {
        console.error('Failed to send push notification:', err)
      })

      return NextResponse.json({ achievement: newAchievement })
    }
  } catch (error) {
    console.error('Error in POST /api/achievements/award:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
