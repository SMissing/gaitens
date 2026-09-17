import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/db'

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
