import { NextRequest, NextResponse } from 'next/server'
import { requireManager, getCurrentUser } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import webpush from 'web-push'

// Set VAPID details for web-push
if (process.env.VAPID_SUBJECT && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )
}

// POST - Send push notification to a user
// Can be called internally (no auth required) or by managers/admins
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, title, body: notificationBody, data, internalSecret } = body

    // Check authorization - either manager/admin or internal secret
    let isAuthorized = false
    try {
      const user = await getCurrentUser()
      if (user && (user.role === 'manager' || user.role === 'admin')) {
        isAuthorized = true
      }
    } catch {
      // No user auth
    }

    if (!isAuthorized && internalSecret !== process.env.INTERNAL_API_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createServerClient()

    if (!userId || !title || !notificationBody) {
      return NextResponse.json(
        { error: 'userId, title, and body are required' },
        { status: 400 }
      )
    }

    // Only send to active users
    const { data: targetUser } = await supabase
      .from('users')
      .select('active')
      .eq('id', userId)
      .single()

    if (!targetUser?.active) {
      return NextResponse.json(
        { message: 'User is inactive — notification suppressed', sent: 0 },
        { status: 200 }
      )
    }

    // Get user's push subscriptions
    const { data: subscriptions, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('userId', userId)

    if (subsError) {
      console.error('Error fetching push subscriptions:', subsError)
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      )
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { message: 'No push subscriptions found for user', sent: 0 },
        { status: 200 }
      )
    }

    // Send notification to each subscription using web-push
    let sentCount = 0
    const errors: string[] = []

    // Check if VAPID keys are configured
    if (!process.env.VAPID_SUBJECT || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      return NextResponse.json(
        { 
          error: 'VAPID keys not configured. Please set VAPID_SUBJECT, NEXT_PUBLIC_VAPID_PUBLIC_KEY, and VAPID_PRIVATE_KEY in environment variables.',
          sent: 0 
        },
        { status: 500 }
      )
    }

    for (const sub of subscriptions) {
      const subscription = sub.subscription as {
        endpoint: string
        keys: {
          p256dh: string
          auth: string
        }
      }

      try {
        // Send push notification using web-push
        await webpush.sendNotification(
          subscription,
          JSON.stringify({
            title,
            body: notificationBody,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            tag: 'achievement',
            data: data || {},
            requireInteraction: false,
            vibrate: [200, 100, 200],
            actions: [
              {
                action: 'view',
                title: 'View Achievement'
              },
              {
                action: 'dismiss',
                title: 'Dismiss'
              }
            ]
          })
        )

        sentCount++
      } catch (error: any) {
        // Handle specific error cases
        if (error.statusCode === 410) {
          // Subscription expired or no longer valid - remove it
          console.log('Subscription expired, removing:', subscription.endpoint)
          try {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('userId', userId)
              .eq('subscription', JSON.stringify(sub.subscription))
          } catch (deleteError) {
            console.error('Error deleting expired subscription:', deleteError)
          }
        } else {
          errors.push(`Failed to send to subscription: ${error.message || error}`)
        }
      }
    }

    return NextResponse.json({
      message: `Sent ${sentCount} notification(s)`,
      sent: sentCount,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Error in POST /api/push/send:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
