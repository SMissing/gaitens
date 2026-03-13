/**
 * Push notification utilities
 * 
 * Note: For production, you'll need to:
 * 1. Generate VAPID keys using: npx web-push generate-vapid-keys
 * 2. Install web-push: npm install web-push
 * 3. Set NEXT_PUBLIC_VAPID_PUBLIC_KEY in .env.local
 * 4. Set VAPID_PRIVATE_KEY in .env.local (server-side only)
 */

import { createServerClient } from './db'

export interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

/**
 * Send a push notification to a user
 * This function will be called when an achievement is awarded
 */
export async function sendPushNotificationToUser(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<void> {
  try {
    const supabase = createServerClient()

    // Get user's push subscriptions
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('userId', userId)

    if (error) {
      console.error('Error fetching push subscriptions:', error)
      return
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log(`No push subscriptions found for user ${userId}`)
      return
    }

    // Send notification to each subscription
    // In production, you'll use web-push library here
    // For now, we'll use the API endpoint approach
    const promises = subscriptions.map(async (sub) => {
      const subscription = sub.subscription as PushSubscription

      try {
        // Call the send API endpoint
        // This will need to be implemented with web-push library
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/push/send`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId,
              title,
              body,
              data,
              subscription, // Pass subscription for server to send
            }),
          }
        )

        if (!response.ok) {
          console.error(`Failed to send push notification: ${response.statusText}`)
        }
      } catch (error) {
        console.error('Error sending push notification:', error)
      }
    })

    await Promise.all(promises)
  } catch (error) {
    console.error('Error in sendPushNotificationToUser:', error)
  }
}
