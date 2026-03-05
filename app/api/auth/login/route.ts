import { NextRequest, NextResponse } from 'next/server'
import { createSession, getUserByStaffCode, recordFailedAttempt, clearFailedAttempts } from '@/lib/auth'
import { createServerClient } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Verify user exists and is active
    const supabase = createServerClient()
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .eq('active', true)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'Invalid user' },
        { status: 404 }
      )
    }

    // Create session
    await createSession(userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
