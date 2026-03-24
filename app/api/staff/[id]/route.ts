import { NextRequest, NextResponse } from 'next/server'
import { requireManager } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { canModifyTargetUser } from '@/lib/staff-permissions'
import type { User, UserRole } from '@/types/database'

// PUT - Update staff member
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await requireManager()
    const supabase = createServerClient()

    const { data: targetRow, error: targetErr } = await supabase
      .from('users')
      .select('*')
      .eq('id', params.id)
      .single()

    if (targetErr || !targetRow) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      )
    }

    const target = targetRow as User

    if (!canModifyTargetUser(currentUser.role, target.role)) {
      return NextResponse.json(
        { error: 'You cannot modify accounts at this level' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, staffCode, role, site, active } = body

    const updates: Partial<User> = {}

    if (name !== undefined) updates.name = name
    if (staffCode !== undefined) {
      if (!/^\d{4}$/.test(staffCode)) {
        return NextResponse.json(
          { error: 'Staff code must be 4 digits' },
          { status: 400 }
        )
      }
      updates.staffCode = staffCode
    }
    if (role !== undefined) {
      if (!['staff', 'manager', 'admin'].includes(role)) {
        return NextResponse.json(
          { error: 'Invalid role' },
          { status: 400 }
        )
      }
      if (
        currentUser.role === 'manager' &&
        (role as UserRole) !== 'staff'
      ) {
        return NextResponse.json(
          { error: 'Managers cannot change role away from staff' },
          { status: 403 }
        )
      }
      updates.role = role as UserRole
    }
    if (site !== undefined) updates.site = site || null
    if (active !== undefined) updates.active = active

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Staff code already exists' },
          { status: 409 }
        )
      }
      console.error('Error updating staff:', error)
      return NextResponse.json(
        { error: 'Failed to update staff member' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(data as User)
  } catch (error) {
    console.error('Error in PUT /api/staff/[id]:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}

// DELETE - Deactivate staff member (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await requireManager()
    const supabase = createServerClient()

    const { data: targetRow, error: targetErr } = await supabase
      .from('users')
      .select('role')
      .eq('id', params.id)
      .single()

    if (targetErr || !targetRow) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      )
    }

    if (
      !canModifyTargetUser(
        currentUser.role,
        (targetRow as { role: UserRole }).role
      )
    ) {
      return NextResponse.json(
        { error: 'You cannot deactivate accounts at this level' },
        { status: 403 }
      )
    }

    const { data, error } = await supabase
      .from('users')
      .update({ active: false })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error deactivating staff:', error)
      return NextResponse.json(
        { error: 'Failed to deactivate staff member' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(data as User)
  } catch (error) {
    console.error('Error in DELETE /api/staff/[id]:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
