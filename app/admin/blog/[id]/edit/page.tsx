import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { PageHeader } from '@/components/layout/PageHeader'
import { BlogPostForm } from '@/components/blog/BlogPostForm'
import { Newspaper } from 'lucide-react'
import { redirect } from 'next/navigation'
import type { BlogPost } from '@/types/database'

export default async function AdminEditBlogPostPage({
  params,
}: {
  params: { id: string }
}) {
  await requireAdmin()
  const supabase = createServerClient()

  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !post) {
    redirect('/admin/blog')
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Edit blog post"
        icon={<Newspaper className="h-6 w-6 text-spirits-cyan" />}
        description="Update title, body, or publishing status"
        showBack={true}
        backHref="/admin/blog"
      />
      <div className="p-4 sm:p-6 lg:p-8 pb-32">
        <BlogPostForm post={post as BlogPost} />
      </div>
    </div>
  )
}
