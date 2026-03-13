import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

// PATCH - Update anonymous report status (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const supabase = createServerClient()

    const body = await request.json()
    const { status } = body

    if (!status || !['submitted', 'in_review', 'resolved'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const { data: report, error } = await supabase
      .from('anonymous_reports')
      .update({
        status,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating anonymous report:', error)
      return NextResponse.json(
        { error: 'Failed to update report' },
        { status: 500 }
      )
    }

    return NextResponse.json({ report })
  } catch (error) {
    console.error('Error in PATCH /api/anonymous-reports/[id]:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
