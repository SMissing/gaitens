import { NextResponse } from 'next/server'
import { requireManager } from '@/lib/auth'
import { createAdminClient, createServerClient } from '@/lib/db'

/**
 * POST — record that the current user accepted the Barred List disclaimer.
 * Increments per-user counter, updates last-accepted time, and appends an audit row.
 */
export async function POST() {
  try {
    const user = await requireManager()

    let supabase
    try {
      supabase = createAdminClient()
    } catch {
      supabase = createServerClient()
    }

    const now = new Date().toISOString()

    const { error: insertError } = await supabase.from('barred_disclaimer_acceptances').insert({
      userId: user.id,
      acceptedAt: now,
    })

    if (insertError) {
      console.error('Error inserting barred disclaimer acceptance:', insertError)
      return NextResponse.json({ error: 'Failed to record acceptance' }, { status: 500 })
    }

    const { data: row, error: fetchError } = await supabase
      .from('users')
      .select('barredDisclaimerAcceptCount')
      .eq('id', user.id)
      .single()

    if (fetchError) {
      console.error('Error fetching user disclaimer count:', fetchError)
      return NextResponse.json(
        { error: 'Acceptance logged but could not update counter (check DB migration)' },
        { status: 500 }
      )
    }

    const prev = typeof row?.barredDisclaimerAcceptCount === 'number' ? row.barredDisclaimerAcceptCount : 0
    const nextCount = prev + 1

    const { error: updateError } = await supabase
      .from('users')
      .update({
        barredDisclaimerAcceptCount: nextCount,
        barredDisclaimerLastAcceptedAt: now,
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating user disclaimer counters:', updateError)
      return NextResponse.json(
        { error: 'Acceptance logged but failed to update profile counter' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      barredDisclaimerAcceptCount: nextCount,
      barredDisclaimerLastAcceptedAt: now,
    })
  } catch (err) {
    console.error('Error in POST /api/barred/disclaimer-accept:', err)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
