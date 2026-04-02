import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { appFeedbackSchema } from '@/lib/validation'

function mapRows(rows: Record<string, unknown>[]) {
  return rows.map((row) => {
    const users = row.users as { name?: string } | null | undefined
    const { users: _u, ...rest } = row
    return {
      ...rest,
      submitterName: users?.name ?? 'Team member',
    }
  })
}

export async function GET() {
  try {
    await requireAuth()
    const supabase = createServerClient()

    const { data: rows, error } = await supabase
      .from('app_feedback')
      .select('*, users(name)')
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Error fetching app feedback:', error)
      return NextResponse.json(
        { error: 'Failed to fetch feedback' },
        { status: 500 }
      )
    }

    return NextResponse.json({ items: mapRows(rows || []) })
  } catch (error) {
    console.error('Error in GET /api/app-feedback:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = createServerClient()

    const body = await request.json()
    const validated = appFeedbackSchema.parse(body)

    const { data: row, error } = await supabase
      .from('app_feedback')
      .insert({
        userId: user.id,
        category: validated.category,
        title: validated.title,
        description: validated.description,
        adminStatus: 'open',
        adminComment: null,
      })
      .select('*, users(name)')
      .single()

    if (error) {
      console.error('Error creating app feedback:', error)
      return NextResponse.json(
        { error: 'Failed to submit feedback' },
        { status: 500 }
      )
    }

    const [mapped] = mapRows([row as Record<string, unknown>])
    return NextResponse.json({ item: mapped }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error in POST /api/app-feedback:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
