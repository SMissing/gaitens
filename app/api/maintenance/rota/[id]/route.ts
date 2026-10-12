import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { z } from 'zod'

const timeSchema = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/)
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

const ROTA_SELECT = '*, user:userId (id, name, role), completedBy:completedById (id, name)'

// Admin: edit the job itself
const editSchema = z.object({
  userId: z.string().uuid().optional(),
  date: dateSchema.optional(),
  startTime: timeSchema.nullable().optional(),
  endTime: timeSchema.nullable().optional(),
  notes: z.string().trim().max(1000).nullable().optional(),
  photos: z.array(z.string().url()).max(6).optional(),
})

// Whoever's doing the job: mark it done / not done (pending clears it)
const statusSchema = z.object({
  status: z.enum(['pending', 'done', 'not_done']),
  completionNotes: z.string().trim().max(1000).nullable().optional(),
})

// PATCH - Admin edits a scheduled job's details; the person rota'd on it, any
//         maintenance account (handover), or an admin can mark it done / not done.
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const supabase = createServerClient()
    const body = await request.json()

    const { data: existing, error: fetchError } = await supabase
      .from('maintenance_rota')
      .select('id, userId')
      .eq('id', params.id)
      .maybeSingle()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
    }

    let update: Record<string, unknown>

    if (body && typeof body === 'object' && 'status' in body) {
      const parsed = statusSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
      }
      const canMark =
        user.role === 'admin' || user.role === 'maintenance' || existing.userId === user.id
      if (!canMark) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
      const cleared = parsed.data.status === 'pending'
      update = {
        status: parsed.data.status,
        completionNotes: cleared ? null : parsed.data.completionNotes || null,
        completedById: cleared ? null : user.id,
        completedAt: cleared ? null : new Date().toISOString(),
      }
    } else {
      if (user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
      const parsed = editSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
      }

      if (parsed.data.userId && parsed.data.userId !== existing.userId) {
        const { data: targetUser } = await supabase
          .from('users')
          .select('id, active')
          .eq('id', parsed.data.userId)
          .maybeSingle()
        if (!targetUser || !targetUser.active) {
          return NextResponse.json(
            { error: 'That account is not an active staff account' },
            { status: 400 }
          )
        }
      }

      update = {}
      for (const [key, value] of Object.entries(parsed.data)) {
        if (value === undefined) continue
        update[key] = typeof value === 'string' && value === '' ? null : value
      }
    }

    update.updatedAt = new Date().toISOString()

    const { data, error } = await supabase
      .from('maintenance_rota')
      .update(update)
      .eq('id', params.id)
      .select(ROTA_SELECT)
      .single()

    if (error) {
      console.error('Error updating rota shift:', error)
      return NextResponse.json({ error: 'Failed to update shift' }, { status: 500 })
    }

    return NextResponse.json({ shift: data })
  } catch (error) {
    console.error('Error in PATCH /api/maintenance/rota/[id]:', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

// DELETE - Remove a scheduled shift (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const supabase = createServerClient()

    const { error } = await supabase
      .from('maintenance_rota')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting rota shift:', error)
      return NextResponse.json({ error: 'Failed to delete shift' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/maintenance/rota/[id]:', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
