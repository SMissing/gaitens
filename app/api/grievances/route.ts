import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/db'
import { requireAuth, requireAdmin } from '@/lib/auth'
import { grievanceSchema } from '@/lib/validation'

// GET - Fetch grievances (admins only)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    const supabase = createServerClient()

    // Fetch all grievances with user information
    const { data: grievances, error } = await supabase
      .from('grievances')
      .select(`
        *,
        user:users!grievances_userId_fkey (
          id,
          name,
          site
        )
      `)
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Error fetching grievances:', error)
      return NextResponse.json(
        { error: 'Failed to fetch grievances' },
        { status: 500 }
      )
    }

    return NextResponse.json({ grievances: grievances || [] })
  } catch (error) {
    console.error('Error in GET /api/grievances:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}

// POST - Create a new grievance (staff only)
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = createServerClient()

    const body = await request.json()
    const validatedData = grievanceSchema.parse(body)

    // Insert the grievance
    const { data: grievance, error } = await supabase
      .from('grievances')
      .insert({
        userId: user.id,
        subject: validatedData.subject,
        content: validatedData.content,
        employeeName: validatedData.employeeName,
        relatesToEmployment: validatedData.relatesToEmployment,
        howToResolve: validatedData.howToResolve,
        otherParties: validatedData.otherParties,
        whatHasBeenDone: validatedData.whatHasBeenDone,
        status: 'submitted',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating grievance:', error)
      return NextResponse.json(
        { error: 'Failed to submit grievance' },
        { status: 500 }
      )
    }

    return NextResponse.json({ grievance }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error in POST /api/grievances:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
