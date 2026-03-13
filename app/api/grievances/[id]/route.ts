import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

// PATCH - Update grievance status (admins only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const supabase = createServerClient()
    const grievanceId = params.id

    const body = await request.json()
    const { status } = body

    if (!status || !['submitted', 'in_review', 'resolved'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const { data: grievance, error } = await supabase
      .from('grievances')
      .update({
        status,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', grievanceId)
      .select()
      .single()

    if (error) {
      console.error('Error updating grievance:', error)
      return NextResponse.json(
        { error: 'Failed to update grievance' },
        { status: 500 }
      )
    }

    return NextResponse.json({ grievance })
  } catch (error) {
    console.error('Error in PATCH /api/grievances/[id]:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
