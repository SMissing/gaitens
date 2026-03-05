import { NextRequest, NextResponse } from 'next/server'
import { clearFailedAttempts } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { staffCode } = await request.json()

    if (!staffCode) {
      return NextResponse.json(
        { error: 'Staff code is required' },
        { status: 400 }
      )
    }

    clearFailedAttempts(staffCode)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
