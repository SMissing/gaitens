import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { createAdminClient, createServerClient } from '@/lib/db'
import webpush from 'web-push'

if (process.env.VAPID_SUBJECT && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  )
}

// Duolingo-style message rotation — keeps reminders fresh
const REMINDER_MESSAGES = [
  { title: 'Training reminder 🎓', body: 'You have required modules to complete. Keep your skills sharp!' },
  { title: 'Don\'t fall behind 🔥', body: 'Your required training is waiting. A few minutes is all it takes.' },
  { title: 'Training time ⚡', body: 'Required modules are still outstanding. Jump in and knock one out!' },
  { title: 'Keep your streak alive 🏆', body: 'Complete a training module today and stay ahead of the pack.' },
  { title: 'Your team is training 📚', body: 'Don\'t get left behind — required training is waiting for you.' },
]

function pickMessage(userId: string): { title: string; body: string } {
  // Rotate through messages based on day + userId hash so different users get different messages
  const dayOfYear = Math.floor(Date.now() / (1000 * 60 * 60 * 24))
  const hash = userId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return REMINDER_MESSAGES[(dayOfYear + hash) % REMINDER_MESSAGES.length]
}

async function sendWebPush(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: object,
): Promise<'sent' | 'expired' | 'error'> {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload))
    return 'sent'
  } catch (err: any) {
    if (err.statusCode === 410) return 'expired'
    return 'error'
  }
}

// POST or GET — supports both Vercel cron (GET) and manual manager trigger (POST)
async function handler(request: NextRequest) {
  // Auth: Vercel cron uses CRON_SECRET header, managers can POST
  const cronSecret = request.headers.get('authorization')?.replace('Bearer ', '')
  const isCron = cronSecret === process.env.CRON_SECRET

  if (!isCron) {
    try {
      const user = await getCurrentUser()
      if (!user || (user.role !== 'manager' && user.role !== 'admin')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  if (!process.env.VAPID_SUBJECT || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return NextResponse.json({ error: 'VAPID keys not configured' }, { status: 500 })
  }

  const adminSupabase = createAdminClient()
  const supabase = createServerClient()
  const now = new Date().toISOString()

  // 1. Get all active users who have push subscriptions
  const { data: subscriptionRows } = await supabase
    .from('push_subscriptions')
    .select('userId, subscription')

  if (!subscriptionRows?.length) {
    return NextResponse.json({ message: 'No subscribers', sent: 0 })
  }

  const subscriberIds = [...new Set(subscriptionRows.map((r) => r.userId))]

  // 2. Filter to active users only
  const { data: activeUsers } = await supabase
    .from('users')
    .select('id, site')
    .in('id', subscriberIds)
    .eq('active', true)

  if (!activeUsers?.length) {
    return NextResponse.json({ message: 'No active subscribers', sent: 0 })
  }

  // 3. For each active user, check if they have incomplete required training
  const { data: allCourses } = await supabase
    .from('training_courses')
    .select('id, site, requiredScope')
    .eq('active', true)

  if (!allCourses?.length) {
    return NextResponse.json({ message: 'No training courses', sent: 0 })
  }

  // Get all unexpired completions for these users
  const { data: completions } = await adminSupabase
    .from('training_completions')
    .select('userId, courseId')
    .in('userId', activeUsers.map((u) => u.id))
    .gt('expiresAt', now)

  const completionSet = new Set(
    completions?.map((c) => `${c.userId}:${c.courseId}`) ?? [],
  )

  // 4. Send reminders only to users who have ≥1 incomplete required course
  let sent = 0
  let skipped = 0
  const expired: string[] = []

  for (const user of activeUsers) {
    const requiredCourses = allCourses.filter((c) => {
      if (c.requiredScope === 'all') return true
      if (c.requiredScope === 'site' && c.site === user.site) return true
      return false
    })

    const hasIncomplete = requiredCourses.some(
      (c) => !completionSet.has(`${user.id}:${c.id}`),
    )

    if (!hasIncomplete) {
      skipped++
      continue
    }

    const message = pickMessage(user.id)
    const payload = {
      title: message.title,
      body: message.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'training-reminder',
      data: { url: '/training' },
    }

    const userSubs = subscriptionRows.filter((r) => r.userId === user.id)
    for (const row of userSubs) {
      const sub = row.subscription as { endpoint: string; keys: { p256dh: string; auth: string } }
      const result = await sendWebPush(sub, payload)

      if (result === 'sent') {
        sent++
      } else if (result === 'expired') {
        expired.push(row.userId)
        // Clean up expired subscription
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('userId', row.userId)
          .eq('subscription', JSON.stringify(sub))
      }
    }
  }

  console.log(`Training reminder: sent=${sent}, skipped=${skipped}, expired=${expired.length}`)

  return NextResponse.json({
    message: `Training reminders sent`,
    sent,
    skipped,
    expiredCleaned: expired.length,
  })
}

export const GET = handler
export const POST = handler
