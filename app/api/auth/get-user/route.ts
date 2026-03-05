import { NextRequest, NextResponse } from 'next/server'
import { getUserByStaffCode, recordFailedAttempt } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { staffCode } = await request.json()

    if (!staffCode) {
      return NextResponse.json(
        { error: 'Staff code is required' },
        { status: 400 }
      )
    }

    const user = await getUserByStaffCode(staffCode)

    if (!user) {
      // Record failed attempt
      recordFailedAttempt(staffCode)
      return NextResponse.json(
        { error: 'Invalid staff code' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      role: user.role,
    })
  } catch (error) {
    console.error('Error in get-user route:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
