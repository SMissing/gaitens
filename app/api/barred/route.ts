import { NextRequest, NextResponse } from 'next/server'
import { requireManager } from '@/lib/auth'
import { createServerClient } from '@/lib/db'

// GET - Fetch all barred people (managers + admins only)
export async function GET(request: NextRequest) {
  try {
    await requireManager()
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('barred_people')
      .select(
        'id, name, imageUrl, reason, barDurationValue, barDurationUnit, barEndDate, createdAt'
      )
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Error fetching barred people:', error)
      return NextResponse.json({ error: 'Failed to fetch barred list' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (err) {
    console.error('Error in GET /api/barred:', err)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

