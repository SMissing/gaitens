import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

// DELETE - Remove a disciplinary (restore a heart)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const adminSupabase = createAdminClient()

    const { id } = params

    // Delete the most recent disciplinary for this user
    const { error } = await adminSupabase
      .from('disciplinaries')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting disciplinary:', error)
      return NextResponse.json(
        { error: 'Failed to restore heart' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/disciplinaries/[id]:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
