'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { BlogPost } from '@/types/database'
import { slugifyTitle } from '@/lib/blog-slug'

interface BlogPostFormProps {
  post?: BlogPost
}

export function BlogPostForm({ post }: BlogPostFormProps) {
  const router = useRouter()
  const isEditing = !!post
  const [title, setTitle] = useState(post?.title ?? '')
  const [slug, setSlug] = useState(post?.slug ?? '')
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '')
  const [body, setBody] = useState(post?.body ?? '')
  const [published, setPublished] = useState(post?.published ?? false)
  const [visibleToStaff, setVisibleToStaff] = useState(post?.visibleToStaff ?? true)
  const [visibleToManager, setVisibleToManager] = useState(post?.visibleToManager ?? true)
  const [visibleToAdmin, setVisibleToAdmin] = useState(post?.visibleToAdmin ?? true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const slugValue = (slug.trim() || slugifyTitle(title)).trim()
    if (!title.trim() || !body.trim()) {
      setError('Title and body are required.')
      return
    }
    if (!visibleToStaff && !visibleToManager && !visibleToAdmin) {
      setError('Choose at least one audience: Staff, Management, or Admin.')
      return
    }

    setLoading(true)
    try {
      if (isEditing && post) {
        const res = await fetch(`/api/blog/${post.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            slug: slugValue,
            excerpt: excerpt.trim() || null,
            body,
            published,
            visibleToStaff,
            visibleToManager,
            visibleToAdmin,
          }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setError(data.error || 'Failed to save')
          return
        }
        router.push('/admin/blog')
        router.refresh()
        return
      }

      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          slug: slugValue,
          excerpt: excerpt.trim() || null,
          body,
          published,
          visibleToStaff,
          visibleToManager,
          visibleToAdmin,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Failed to create')
        return
      }
      router.push('/admin/blog')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
      {error && (
        <p className="text-sm text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="blog-title">Title</Label>
        <Input
          id="blog-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title"
          required
          className="bg-background/80"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="blog-slug">URL slug</Label>
        <Input
          id="blog-slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder={slugifyTitle(title || 'your-post-title')}
          className="bg-background/80 font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Leave blank to derive from the title. Used in the public URL: /blog/your-slug
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="blog-excerpt">Excerpt (optional)</Label>
        <Input
          id="blog-excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Short summary for the list view"
          className="bg-background/80"
        />
      </div>

      <div className="space-y-3 rounded-xl border border-border/60 bg-card/30 p-4">
        <div>
          <Label className="text-base">Who can see this post?</Label>
          <p className="text-xs text-muted-foreground mt-1">
            When published, only people in the selected categories will see it on the blog.
          </p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer touch-manipulation">
          <input
            type="checkbox"
            checked={visibleToStaff}
            onChange={(e) => setVisibleToStaff(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          <span className="text-sm font-medium">Staff</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer touch-manipulation">
          <input
            type="checkbox"
            checked={visibleToManager}
            onChange={(e) => setVisibleToManager(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          <span className="text-sm font-medium">Management</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer touch-manipulation">
          <input
            type="checkbox"
            checked={visibleToAdmin}
            onChange={(e) => setVisibleToAdmin(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          <span className="text-sm font-medium">Admin</span>
        </label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="blog-body">Body</Label>
        <textarea
          id="blog-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={16}
          required
          placeholder="Write your post. Line breaks are preserved."
          className="w-full rounded-md border border-input bg-background/80 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer touch-manipulation">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="h-4 w-4 rounded border-border"
        />
        <span className="text-sm font-medium">Published (visible on the blog)</span>
      </label>

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving…' : isEditing ? 'Save changes' : 'Create post'}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/blog">Cancel</Link>
        </Button>
      </div>
    </form>
  )
}
