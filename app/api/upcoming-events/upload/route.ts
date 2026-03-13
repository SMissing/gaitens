import { NextRequest, NextResponse } from 'next/server'
import { requireManager } from '@/lib/auth'
import { createAdminClient, createServerClient } from '@/lib/db'

// POST - Upload image for upcoming event
export async function POST(request: NextRequest) {
  try {
    await requireManager()
    // Try to use admin client (bypasses RLS), fallback to regular client
    let supabase
    try {
      supabase = createAdminClient()
    } catch {
      // Fallback to regular client if service key not available
      supabase = createServerClient()
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExt = file.name.split('.').pop()
    const fileName = `events/${timestamp}-${randomString}.${fileExt}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage (using photo-albums bucket or create events bucket)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('photo-albums')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload image' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('photo-albums')
      .getPublicUrl(fileName)

    return NextResponse.json({
      url: urlData.publicUrl,
      path: fileName,
    })
  } catch (error) {
    console.error('Error in POST /api/upcoming-events/upload:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
