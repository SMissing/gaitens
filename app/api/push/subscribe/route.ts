import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getCurrentUser } from '@/lib/auth'
import { createServerClient } from '@/lib/db'

// POST - Register a push notification subscription
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = createServerClient()

    const body = await request.json()
    const { subscription } = body

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: 'Invalid subscription object' },
        { status: 400 }
      )
    }

    // Check if subscription already exists
    const { data: existing } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('userId', user.id)
      .eq('subscription', JSON.stringify(subscription))
      .single()

    if (existing) {
      // Update timestamp
      await supabase
        .from('push_subscriptions')
        .update({ updatedAt: new Date().toISOString() })
        .eq('id', existing.id)

      return NextResponse.json({ message: 'Subscription updated' })
    }

    // Create new subscription
    const { error } = await supabase
      .from('push_subscriptions')
      .insert({
        userId: user.id,
        subscription: subscription,
      })

    if (error) {
      console.error('Error creating push subscription:', error)
      return NextResponse.json(
        { error: 'Failed to save subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Subscription registered successfully' })
  } catch (error) {
    console.error('Error in POST /api/push/subscribe:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}

// DELETE - Unregister a push notification subscription
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = createServerClient()

    const body = await request.json()
    const { subscription } = body

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription object required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('userId', user.id)
      .eq('subscription', JSON.stringify(subscription))

    if (error) {
      console.error('Error deleting push subscription:', error)
      return NextResponse.json(
        { error: 'Failed to delete subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Subscription removed successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/push/subscribe:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
