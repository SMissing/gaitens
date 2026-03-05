import { NextRequest, NextResponse } from 'next/server'
import { isCodeLocked } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { staffCode } = await request.json()

    if (!staffCode) {
      return NextResponse.json(
        { error: 'Staff code is required' },
        { status: 400 }
      )
    }

    const locked = isCodeLocked(staffCode)

    if (locked) {
      // Get lock expiry time
      const { getLockExpiry } = await import('@/lib/auth')
      const lockedUntil = getLockExpiry(staffCode)
      return NextResponse.json({
        locked: true,
        lockedUntil: lockedUntil || Date.now() + 5 * 60 * 1000,
      })
    }

    return NextResponse.json({ locked: false })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
