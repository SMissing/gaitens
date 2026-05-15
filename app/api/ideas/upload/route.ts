import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createAdminClient, createServerClient } from '@/lib/db'

// POST - Upload image for idea (optional attachment)
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    let supabase
    try {
      supabase = createAdminClient()
    } catch {
      supabase = createServerClient()
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExt = file.name.split('.').pop() || 'jpg'
    const fileName = `ideas/${user.id}/${timestamp}-${randomString}.${fileExt}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabase.storage
      .from('ideas')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Error uploading idea image:', uploadError)
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from('ideas').getPublicUrl(fileName)

    return NextResponse.json({
      url: urlData.publicUrl,
      path: fileName,
    })
  } catch (error) {
    console.error('Error in POST /api/ideas/upload:', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
