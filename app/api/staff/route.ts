import { NextRequest, NextResponse } from 'next/server'
import { requireManager } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import type { User } from '@/types/database'

// GET all staff members
export async function GET(request: NextRequest) {
  try {
    await requireManager()
    const supabase = createServerClient()
    
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')
    const role = searchParams.get('role')
    const site = searchParams.get('site')
    const search = searchParams.get('search')

    let query = supabase
      .from('users')
      .select('*')
      .order('createdAt', { ascending: false })

    if (active !== null && active !== '') {
      query = query.eq('active', active === 'true')
    }

    if (role) {
      query = query.eq('role', role)
    }

    if (site) {
      query = query.eq('site', site)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,staffCode.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching staff:', error)
      return NextResponse.json(
        { error: 'Failed to fetch staff' },
        { status: 500 }
      )
    }

    return NextResponse.json(data as User[])
  } catch (error) {
    console.error('Error in GET /api/staff:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}

// POST - Create new staff member
export async function POST(request: NextRequest) {
  try {
    await requireManager()
    const supabase = createServerClient()
    
    const body = await request.json()
    const { name, staffCode, role, site } = body

    if (!name || !staffCode || !role) {
      return NextResponse.json(
        { error: 'Name, staff code, and role are required' },
        { status: 400 }
      )
    }

    // Validate staff code format (4 digits)
    if (!/^\d{4}$/.test(staffCode)) {
      return NextResponse.json(
        { error: 'Staff code must be 4 digits' },
        { status: 400 }
      )
    }

    // Validate role
    if (!['staff', 'manager', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('users')
      .insert({
        name,
        staffCode,
        role,
        site: site || null,
        active: true,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Staff code already exists' },
          { status: 409 }
        )
      }
      console.error('Error creating staff:', error)
      return NextResponse.json(
        { error: 'Failed to create staff member' },
        { status: 500 }
      )
    }

    return NextResponse.json(data as User, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/staff:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
