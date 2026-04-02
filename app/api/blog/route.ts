import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { slugifyTitle } from '@/lib/blog-slug'
import { ensureUniqueSlug } from '@/lib/blog-slug-server'
import type { BlogPost } from '@/types/database'
import { hasAtLeastOneAudience } from '@/lib/blog-visibility'

const createSchema = z
  .object({
    title: z.string().min(1, 'Title is required').max(300),
    excerpt: z.string().max(500).nullable().optional(),
    body: z.string().min(1, 'Body is required').max(100_000),
    slug: z.string().max(200).optional(),
    published: z.boolean().optional(),
    visibleToStaff: z.boolean().optional(),
    visibleToManager: z.boolean().optional(),
    visibleToAdmin: z.boolean().optional(),
  })
  .refine(
    (data) =>
      hasAtLeastOneAudience({
        visibleToStaff: data.visibleToStaff ?? true,
        visibleToManager: data.visibleToManager ?? true,
        visibleToAdmin: data.visibleToAdmin ?? true,
      }),
    { message: 'Select at least one audience: Staff, Management, or Admin' }
  )

// POST — create post (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin()
    const supabase = createServerClient()
    const json = await request.json()
    const parsed = createSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }

    const { title, body, excerpt } = parsed.data
    const published = parsed.data.published ?? false
    const visibleToStaff = parsed.data.visibleToStaff ?? true
    const visibleToManager = parsed.data.visibleToManager ?? true
    const visibleToAdmin = parsed.data.visibleToAdmin ?? true
    const baseSlug = slugifyTitle(parsed.data.slug?.trim() || title)
    const slug = await ensureUniqueSlug(baseSlug)

    const now = new Date().toISOString()
    const publishedAt = published ? now : null

    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        slug,
        title: title.trim(),
        excerpt: excerpt?.trim() || null,
        body,
        published,
        publishedAt,
        visibleToStaff,
        visibleToManager,
        visibleToAdmin,
        createdBy: user.id,
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating blog post:', error)
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
    }

    return NextResponse.json({ post: data as BlogPost }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/blog:', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
