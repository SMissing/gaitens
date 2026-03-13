import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/db'
import { requireAuth, requireAdmin } from '@/lib/auth'

const anonymousReportSchema = z.object({
  note: z.string().min(1, 'Note is required').max(2000, 'Note is too long'),
  reportDate: z.string().min(1, 'Date is required'),
})

// GET - Fetch anonymous reports (admins only)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    const supabase = createServerClient()

    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status')

    let query = supabase
      .from('anonymous_reports')
      .select('*')
      .order('createdAt', { ascending: false })

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    const { data: reports, error } = await query

    if (error) {
      console.error('Error fetching anonymous reports:', error)
      return NextResponse.json(
        { error: 'Failed to fetch reports' },
        { status: 500 }
      )
    }

    return NextResponse.json({ reports: reports || [] })
  } catch (error) {
    console.error('Error in GET /api/anonymous-reports:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}

// POST - Create a new anonymous report (staff only)
export async function POST(request: NextRequest) {
  try {
    await requireAuth() // Any authenticated user can submit
    const supabase = createServerClient()

    const body = await request.json()
    const validatedData = anonymousReportSchema.parse(body)

    // Insert the report (no userId stored - anonymous)
    const { data: report, error } = await supabase
      .from('anonymous_reports')
      .insert({
        note: validatedData.note.trim(),
        reportDate: validatedData.reportDate, // Supabase handles camelCase to snake_case conversion
        status: 'submitted',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating anonymous report:', error)
      return NextResponse.json(
        { error: 'Failed to submit report' },
        { status: 500 }
      )
    }

    return NextResponse.json({ report }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error in POST /api/anonymous-reports:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
