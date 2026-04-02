import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { isAppFeedbackITUser } from '@/lib/app-feedback-config'
import { appFeedbackAdminPatchSchema } from '@/lib/validation'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!isAppFeedbackITUser(user.staffCode)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabase = createServerClient()

    const body = await request.json()
    const validated = appFeedbackAdminPatchSchema.parse(body)

    const adminComment =
      validated.adminComment === undefined
        ? undefined
        : validated.adminComment === null || validated.adminComment === ''
          ? null
          : validated.adminComment

    const updatePayload: Record<string, unknown> = {
      adminStatus: validated.adminStatus,
      updatedAt: new Date().toISOString(),
    }
    if (adminComment !== undefined) {
      updatePayload.adminComment = adminComment
    }

    const { data: row, error } = await supabase
      .from('app_feedback')
      .update(updatePayload)
      .eq('id', params.id)
      .select('*, users(name)')
      .single()

    if (error) {
      console.error('Error updating app feedback:', error)
      return NextResponse.json(
        { error: 'Failed to update feedback' },
        { status: 500 }
      )
    }

    if (!row) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const users = (row as { users?: { name?: string } }).users
    const { users: _u, ...rest } = row as Record<string, unknown>
    const item = {
      ...rest,
      submitterName: users?.name ?? 'Team member',
    }

    return NextResponse.json({ item })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error in PATCH /api/app-feedback/[id]:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
