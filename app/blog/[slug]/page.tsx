import Link from 'next/link'
import { format } from 'date-fns'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { requireAuth } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { PageHeader } from '@/components/layout/PageHeader'
import { BlogBody } from '@/components/blog/BlogBody'
import { Newspaper } from 'lucide-react'
import type { BlogPost } from '@/types/database'
import { userCanSeeBlogPost } from '@/lib/blog-visibility'

type PageProps = { params: { slug: string } }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createServerClient()
  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, excerpt')
    .eq('slug', params.slug)
    .maybeSingle()

  if (!post) {
    return { title: 'Blog' }
  }

  return {
    title: `${post.title} · Blog`,
    description: post.excerpt || undefined,
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const user = await requireAuth()
  const supabase = createServerClient()

  const { data: row, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', params.slug)
    .maybeSingle()

  if (error || !row) {
    notFound()
  }

  const post = row as BlogPost
  if (!post.published && user.role !== 'admin') {
    notFound()
  }
  if (post.published && !userCanSeeBlogPost(user.role, post)) {
    notFound()
  }

  const { data: authorRow } = await supabase
    .from('users')
    .select('name')
    .eq('id', post.createdBy)
    .maybeSingle()

  const authorName = authorRow?.name || 'Editor'
  const dateStr = post.publishedAt || post.createdAt
  const dateLabel = format(new Date(dateStr), 'd MMMM yyyy')

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title={post.title}
        icon={<Newspaper className="h-6 w-6 text-spirits-cyan" />}
        description={undefined}
        showBack={true}
        backHref="/blog"
      />
      <div className="p-4 sm:p-6 lg:p-8 pb-32">
        <article className="max-w-3xl mx-auto">
          <p className="text-sm text-muted-foreground mb-2">
            {dateLabel}
            <span className="mx-2">·</span>
            {authorName}
          </p>
          {!post.published && (
            <p className="text-xs font-medium text-amber-400/90 bg-amber-950/30 border border-amber-900/40 rounded-lg px-3 py-2 mb-6">
              Draft — only visible to admins
            </p>
          )}
          <BlogBody text={post.body} />
          <div className="mt-10 pt-6 border-t border-border/50">
            <Link
              href="/blog"
              className="text-sm font-medium text-spirits-cyan hover:underline"
            >
              ← All posts
            </Link>
          </div>
        </article>
      </div>
    </div>
  )
}
