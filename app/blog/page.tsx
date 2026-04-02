import Link from 'next/link'
import { format } from 'date-fns'
import { requireAuth } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { PageHeader } from '@/components/layout/PageHeader'
import { Newspaper } from 'lucide-react'
import type { BlogPost } from '@/types/database'

export default async function BlogPage() {
  const user = await requireAuth()
  const supabase = createServerClient()

  let listQuery = supabase
    .from('blog_posts')
    .select('id, slug, title, excerpt, body, publishedAt, createdAt')
    .eq('published', true)

  if (user.role === 'staff') {
    listQuery = listQuery.eq('visibleToStaff', true)
  } else if (user.role === 'manager') {
    listQuery = listQuery.eq('visibleToManager', true)
  } else if (user.role === 'admin') {
    listQuery = listQuery.eq('visibleToAdmin', true)
  }

  const { data: rows, error } = await listQuery.order('publishedAt', {
    ascending: false,
    nullsFirst: false,
  })

  if (error) {
    console.error('Error loading blog posts:', error)
  }

  const posts = (rows || []) as Pick<
    BlogPost,
    'id' | 'slug' | 'title' | 'excerpt' | 'body' | 'publishedAt' | 'createdAt'
  >[]

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Blog"
        icon={<Newspaper className="h-6 w-6 text-spirits-cyan" />}
        description="News and updates from the business"
        showBack={true}
        backHref="/dashboard"
      />
      <div className="p-4 sm:p-6 lg:p-8 pb-32">
        <div className="max-w-3xl mx-auto space-y-6">
          {!posts.length ? (
            <p className="text-muted-foreground text-center py-12">
              No posts yet. Check back soon.
            </p>
          ) : (
            <ul className="space-y-4">
              {posts.map((post) => {
                const dateStr = post.publishedAt || post.createdAt
                const dateLabel = format(new Date(dateStr), 'd MMMM yyyy')
                const summary =
                  post.excerpt?.trim() ||
                  post.body.slice(0, 180).trim() + (post.body.length > 180 ? '…' : '')

                return (
                  <li key={post.id}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="block rounded-xl border border-border/60 bg-card/40 p-4 sm:p-5 hover:border-spirits-cyan/40 hover:bg-card/60 transition-colors"
                    >
                      <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                        {post.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">{dateLabel}</p>
                      <p className="text-sm text-foreground/80 mt-3 leading-relaxed line-clamp-3">
                        {summary}
                      </p>
                      <span className="inline-block mt-3 text-sm font-medium text-spirits-cyan">
                        Read more →
                      </span>
                    </Link>
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
