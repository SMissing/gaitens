import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient, createAdminClient } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

const disciplinarySchema = z.object({
  userId: z.string().uuid(),
  reason: z.string().nullish(),
})

// GET - Fetch all staff with disciplinary counts
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    const supabase = createServerClient()
    const adminSupabase = createAdminClient()

    // Fetch all staff members
    const { data: staff, error: staffError } = await supabase
      .from('users')
      .select('id, name, site, role')
      .in('role', ['staff', 'manager'])
      .eq('active', true)
      .order('name', { ascending: true })

    if (staffError) {
      console.error('Error fetching staff:', staffError)
      return NextResponse.json(
        { error: 'Failed to fetch staff' },
        { status: 500 }
      )
    }

    // Fetch all disciplinaries using admin client to bypass RLS
    const { data: disciplinaries, error: disciplinaryError } = await adminSupabase
      .from('disciplinaries')
      .select('id, userId, createdBy, reason, createdAt')
      .order('createdAt', { ascending: false })

    if (disciplinaryError) {
      console.error('Error fetching disciplinaries:', disciplinaryError)
      return NextResponse.json(
        { error: 'Failed to fetch disciplinaries' },
        { status: 500 }
      )
    }

    // Group disciplinaries by user and count them
    const disciplinaryCounts = new Map<string, number>()
    const disciplinaryList = new Map<string, any[]>()

    disciplinaries?.forEach((disciplinary: any) => {
      const userId = disciplinary.userId
      disciplinaryCounts.set(userId, (disciplinaryCounts.get(userId) || 0) + 1)
      
      if (!disciplinaryList.has(userId)) {
        disciplinaryList.set(userId, [])
      }
      disciplinaryList.get(userId)!.push(disciplinary)
    })

    // Combine staff with disciplinary counts
    const staffWithDisciplinaries = (staff || []).map((member: any) => {
      const count = disciplinaryCounts.get(member.id) || 0
      const remainingHearts = Math.max(0, 3 - count)
      return {
        ...member,
        disciplinaryCount: count,
        remainingHearts,
        disciplinaries: disciplinaryList.get(member.id) || [],
      }
    })

    return NextResponse.json({ staff: staffWithDisciplinaries })
  } catch (error) {
    console.error('Error in GET /api/disciplinaries:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}

// POST - Create a new disciplinary
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin()
    const supabase = createServerClient()
    const adminSupabase = createAdminClient()

    const body = await request.json()
    const validatedData = disciplinarySchema.parse(body)

    // Check if user already has 3 disciplinaries
    const { data: existingDisciplinaries } = await adminSupabase
      .from('disciplinaries')
      .select('id')
      .eq('userId', validatedData.userId)

    if ((existingDisciplinaries?.length || 0) >= 3) {
      return NextResponse.json(
        { error: 'Staff member already has 3 disciplinaries' },
        { status: 400 }
      )
    }

    // Insert the disciplinary using admin client to bypass RLS
    const { data: disciplinary, error } = await adminSupabase
      .from('disciplinaries')
      .insert({
        userId: validatedData.userId,
        createdBy: admin.id,
        reason: validatedData.reason || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating disciplinary:', error)
      return NextResponse.json(
        { error: 'Failed to create disciplinary' },
        { status: 500 }
      )
    }

    return NextResponse.json({ disciplinary }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors)
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error in POST /api/disciplinaries:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}

// DELETE - Remove the most recent disciplinary for a user (restore a heart)
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin()
    const adminSupabase = createAdminClient()

    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Get the most recent disciplinary for this user
    const { data: recentDisciplinary } = await adminSupabase
      .from('disciplinaries')
      .select('id')
      .eq('userId', userId)
      .order('createdAt', { ascending: false })
      .limit(1)
      .single()

    if (!recentDisciplinary) {
      return NextResponse.json(
        { error: 'No disciplinary found to restore' },
        { status: 404 }
      )
    }

    // Delete the most recent disciplinary
    const { error } = await adminSupabase
      .from('disciplinaries')
      .delete()
      .eq('id', recentDisciplinary.id)

    if (error) {
      console.error('Error deleting disciplinary:', error)
      return NextResponse.json(
        { error: 'Failed to restore heart' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/disciplinaries:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
