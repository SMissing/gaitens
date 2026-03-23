import { NextRequest, NextResponse } from 'next/server'
import { requireManager } from '@/lib/auth'
import { createAdminClient, createServerClient } from '@/lib/db'
import { z } from 'zod'

const uploadFieldSchema = z.object({
  name: z.string().trim().optional(),
  reason: z.string().trim().min(1, 'Reason is required'),
  barDurationValue: z.coerce.number().int().min(1, 'Length must be >= 1'),
  barDurationUnit: z.enum(['days', 'weeks', 'months', 'years']),
})

function addDuration(from: Date, value: number, unit: 'days' | 'weeks' | 'months' | 'years'): Date {
  const d = new Date(from)
  switch (unit) {
    case 'days':
      d.setDate(d.getDate() + value)
      return d
    case 'weeks':
      d.setDate(d.getDate() + value * 7)
      return d
    case 'months':
      d.setMonth(d.getMonth() + value)
      return d
    case 'years':
      d.setFullYear(d.getFullYear() + value)
      return d
    default:
      return d
  }
}

// POST - Upload image + create barred person record (managers + admins only)
export async function POST(request: NextRequest) {
  try {
    const user = await requireManager()

    // Try to use admin client (bypasses RLS), fallback to regular client
    let supabase
    try {
      supabase = createAdminClient()
    } catch {
      supabase = createServerClient()
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
    }

    const name = formData.get('name')?.toString() || undefined
    const reason = formData.get('reason')?.toString() || ''
    const barDurationValue = formData.get('barDurationValue')?.toString() || '1'
    const barDurationUnit = (formData.get('barDurationUnit')?.toString() || 'months') as
      | 'days'
      | 'weeks'
      | 'months'
      | 'years'

    const validated = uploadFieldSchema.parse({
      name,
      reason,
      barDurationValue,
      barDurationUnit,
    })

    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExt = file.name.split('.').pop() || 'jpg'

    // Reuse the existing public bucket used by other photo features
    const bucket = 'photo-albums'
    const imageFolder = 'barred'
    const fileName = `${imageFolder}/${timestamp}-${randomString}.${fileExt}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Error uploading barred image:', uploadError)
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName)
    const imageUrl = urlData.publicUrl

    const endDate = addDuration(new Date(), validated.barDurationValue, validated.barDurationUnit)

    // NOTE: This expects a `barred_people` table with the columns used below.
    const { data: inserted, error: dbError } = await supabase
      .from('barred_people')
      .insert({
        name: validated.name ?? null,
        imageUrl,
        imagePath: fileName,
        reason: validated.reason,
        barDurationValue: validated.barDurationValue,
        barDurationUnit: validated.barDurationUnit,
        barEndDate: endDate.toISOString(),
        createdBy: user.id,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Error saving barred person:', dbError)
      // Best-effort cleanup
      try {
        await supabase.storage.from(bucket).remove([fileName])
      } catch (e) {
        // ignore
      }
      return NextResponse.json({ error: 'Failed to save barred person' }, { status: 500 })
    }

    return NextResponse.json({ success: true, person: inserted }, { status: 201 })
  } catch (err) {
    console.error('Error in POST /api/barred/upload:', err)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

