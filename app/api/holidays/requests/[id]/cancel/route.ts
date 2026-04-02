import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/db'

// DELETE - Cancel/remove an approved holiday request (admins only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const supabase = createServerClient()

    // Get the holiday request to verify it exists
    const { data: holidayRequest, error: fetchError } = await supabase
      .from('holiday_requests')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError || !holidayRequest) {
      return NextResponse.json(
        { error: 'Holiday request not found' },
        { status: 404 }
      )
    }

    // Mark as cancelled (admin removed an approved holiday) — keeps audit trail
    const { data: updatedData, error } = await supabase
      .from('holiday_requests')
      .update({
        status: 'cancelled',
        cancellationRequestedAt: null,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating holiday request:', error)
      return NextResponse.json(
        { error: 'Failed to remove holiday request', details: error.message },
        { status: 500 }
      )
    }

    console.log('Successfully cancelled holiday request:', params.id, updatedData)
    return NextResponse.json({ 
      success: true, 
      updatedId: params.id,
      updatedData 
    })
  } catch (error) {
    console.error('Error in DELETE /api/holidays/requests/[id]/cancel:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
