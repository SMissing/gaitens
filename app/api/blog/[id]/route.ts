import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { slugifyTitle } from '@/lib/blog-slug'
import { ensureUniqueSlug } from '@/lib/blog-slug-server'
import type { BlogPost } from '@/types/database'
import { hasAtLeastOneAudience } from '@/lib/blog-visibility'

const patchSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  excerpt: z.string().max(500).nullable().optional(),
  body: z.string().min(1).max(100_000).optional(),
  slug: z.string().max(200).optional(),
  published: z.boolean().optional(),
  visibleToStaff: z.boolean().optional(),
  visibleToManager: z.boolean().optional(),
  visibleToAdmin: z.boolean().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const { id } = params
    const supabase = createServerClient()
    const json = await request.json()
    const parsed = patchSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }

    const { data: existing, error: fetchError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    }

    if (parsed.data.title !== undefined) updates.title = parsed.data.title.trim()
    if (parsed.data.excerpt !== undefined) {
      updates.excerpt = parsed.data.excerpt?.trim() || null
    }
    if (parsed.data.body !== undefined) updates.body = parsed.data.body

    const ex = existing as BlogPost
    const mergedVisibility = {
      visibleToStaff:
        parsed.data.visibleToStaff !== undefined ? parsed.data.visibleToStaff : ex.visibleToStaff ?? true,
      visibleToManager:
        parsed.data.visibleToManager !== undefined
          ? parsed.data.visibleToManager
          : ex.visibleToManager ?? true,
      visibleToAdmin:
        parsed.data.visibleToAdmin !== undefined ? parsed.data.visibleToAdmin : ex.visibleToAdmin ?? true,
    }
    if (
      parsed.data.visibleToStaff !== undefined ||
      parsed.data.visibleToManager !== undefined ||
      parsed.data.visibleToAdmin !== undefined
    ) {
      if (!hasAtLeastOneAudience(mergedVisibility)) {
        return NextResponse.json(
          { error: 'Select at least one audience: Staff, Management, or Admin' },
          { status: 400 }
        )
      }
      updates.visibleToStaff = mergedVisibility.visibleToStaff
      updates.visibleToManager = mergedVisibility.visibleToManager
      updates.visibleToAdmin = mergedVisibility.visibleToAdmin
    }

    let nextSlug: string | undefined
    if (parsed.data.slug !== undefined) {
      const base = slugifyTitle(parsed.data.slug.trim())
      nextSlug = await ensureUniqueSlug(base, id)
      updates.slug = nextSlug
    }

    const nextPublished =
      parsed.data.published !== undefined ? parsed.data.published : (existing as BlogPost).published

    if (parsed.data.published !== undefined) {
      updates.published = nextPublished
      const wasPublished = (existing as BlogPost).published
      if (nextPublished && !wasPublished) {
        updates.publishedAt = new Date().toISOString()
      }
      if (!nextPublished) {
        updates.publishedAt = null
      }
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating blog post:', error)
      return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
    }

    return NextResponse.json({ post: data as BlogPost })
  } catch (error) {
    console.error('Error in PATCH /api/blog/[id]:', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const { id } = params
    const supabase = createServerClient()

    const { error } = await supabase.from('blog_posts').delete().eq('id', id)

    if (error) {
      console.error('Error deleting blog post:', error)
      return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error in DELETE /api/blog/[id]:', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
