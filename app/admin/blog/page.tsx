import Link from 'next/link'
import { format } from 'date-fns'
import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { DeleteBlogPostButton } from '@/components/blog/DeleteBlogPostButton'
import { Newspaper, Pencil, Plus } from 'lucide-react'
import type { BlogPost } from '@/types/database'

function audienceSummary(post: BlogPost): string {
  const parts: string[] = []
  if (post.visibleToStaff ?? true) parts.push('Staff')
  if (post.visibleToManager ?? true) parts.push('Management')
  if (post.visibleToAdmin ?? true) parts.push('Admin')
  return parts.length ? parts.join(' · ') : '—'
}

export default async function AdminBlogPage() {
  await requireAdmin()
  const supabase = createServerClient()

  const { data: rows, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('updatedAt', { ascending: false })

  if (error) {
    console.error('Error loading blog posts:', error)
  }

  const posts = (rows || []) as BlogPost[]

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Blog"
        icon={<Newspaper className="h-6 w-6 text-spirits-cyan" />}
        description="Create and manage blog posts"
        showBack={true}
        backHref="/dashboard"
      />
      <div className="p-4 sm:p-6 lg:p-8 pb-32">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex justify-end">
            <Button asChild>
              <Link href="/admin/blog/new">
                <Plus className="h-4 w-4" />
                New post
              </Link>
            </Button>
          </div>

          {!posts.length ? (
            <p className="text-muted-foreground text-center py-12">
              No posts yet. Create one to get started.
            </p>
          ) : (
            <ul className="space-y-3">
              {posts.map((post) => {
                const dateStr = post.updatedAt
                const dateLabel = format(new Date(dateStr), 'd MMM yyyy · HH:mm')
                return (
                  <li
                    key={post.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-border/60 bg-card/40 p-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground truncate">{post.title}</span>
                        {post.published ? (
                          <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-emerald-950/50 text-emerald-400 border border-emerald-900/40">
                            Live
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                            Draft
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{dateLabel}</p>
                      <p className="text-[11px] text-muted-foreground/90 mt-1">
                        Visible to: {audienceSummary(post)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                          View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/blog/${post.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Link>
                      </Button>
                      <DeleteBlogPostButton id={post.id} />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
