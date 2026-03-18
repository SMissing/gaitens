import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient, createServerClient } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

const uploadSchema = z.object({
  meetingId: z.string().uuid(),
})

type AttachmentRow = {
  id: string
  meeting_id: string
  file_name: string
  mime_type: string | null
  storage_path: string
  uploaded_by: string | null
  created_at: string
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const meetingId = params.id

    const supabase = createServerClient()

    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id, requested_by, requested_for')
      .eq('id', meetingId)
      .single()

    if (meetingError || !meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }

    const isInvolved = meeting.requested_by === user.id || meeting.requested_for === user.id
    if (!isInvolved) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { data: attachments, error } = await supabase
      .from('meeting_attachments')
      .select('id, meeting_id, file_name, mime_type, storage_path, uploaded_by, created_at')
      .eq('meeting_id', meetingId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching meeting attachments:', error)
      return NextResponse.json({ error: 'Failed to fetch attachments' }, { status: 500 })
    }

    const bucket = 'meeting-attachments'

    const expanded = (attachments || []).map((a: AttachmentRow) => {
      const publicUrl = supabase.storage.from(bucket).getPublicUrl(a.storage_path).data.publicUrl
      return {
        id: a.id,
        fileName: a.file_name,
        mimeType: a.mime_type,
        url: publicUrl,
        storagePath: a.storage_path,
        createdAt: a.created_at,
      }
    })

    return NextResponse.json({ attachments: expanded })
  } catch (err) {
    console.error('Error in GET /api/meetings/[id]/attachments:', err)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()

    const bodyMeeting = uploadSchema.parse({ meetingId: params.id })

    // Try to use admin client (bypasses RLS), fallback to regular client
    let supabase
    try {
      supabase = createAdminClient()
    } catch {
      supabase = createServerClient()
    }

    // Permission check: only requester/recipient can upload attachments
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id, requested_by, requested_for')
      .eq('id', bodyMeeting.meetingId)
      .single()

    if (meetingError || !meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }

    const isInvolved = meeting.requested_by === user.id || meeting.requested_for === user.id
    if (!isInvolved) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    const bucket = 'meeting-attachments'
    const uploaded: Array<{ id: string; fileName: string; url: string }> = []

    for (const file of files) {
      if (!file) continue

      if (file.size > 25 * 1024 * 1024) {
        return NextResponse.json({ error: 'Each file must be <= 25MB' }, { status: 400 })
      }

      const timestamp = Date.now()
      const randomString = Math.random().toString(36).slice(2, 12)
      const fileExt = (file.name.split('.').pop() || '').toLowerCase()
      const safeExt = fileExt ? fileExt : 'bin'
      const storagePath = `meeting-attachments/${bodyMeeting.meetingId}/${timestamp}-${randomString}.${safeExt}`

      const buffer = Buffer.from(await file.arrayBuffer())

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(storagePath, buffer, {
          contentType: file.type || 'application/octet-stream',
          upsert: false,
        })

      if (uploadError) {
        console.error('Error uploading meeting attachment file:', uploadError)
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
      }

      const publicUrl = supabase.storage.from(bucket).getPublicUrl(storagePath).data.publicUrl

      const { data: created, error: dbError } = await supabase
        .from('meeting_attachments')
        .insert({
          meeting_id: bodyMeeting.meetingId,
          file_name: file.name,
          mime_type: file.type || null,
          storage_path: storagePath,
          uploaded_by: user.id,
        })
        .select()
        .single()

      if (dbError) {
        console.error('Error saving meeting attachment metadata:', dbError)
        // Best-effort cleanup
        await supabase.storage.from(bucket).remove([storagePath])
        return NextResponse.json({ error: 'Failed to save attachment metadata' }, { status: 500 })
      }

      uploaded.push({ id: created.id, fileName: file.name, url: publicUrl })
    }

    return NextResponse.json({ attachments: uploaded })
  } catch (err) {
    console.error('Error in POST /api/meetings/[id]/attachments:', err)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

