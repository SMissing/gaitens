import { requireAdmin } from '@/lib/auth'
import { PageHeader } from '@/components/layout/PageHeader'
import { BlogPostForm } from '@/components/blog/BlogPostForm'
import { Newspaper } from 'lucide-react'

export default async function AdminNewBlogPostPage() {
  await requireAdmin()

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="New blog post"
        icon={<Newspaper className="h-6 w-6 text-spirits-cyan" />}
        description="Write a post for the Community blog"
        showBack={true}
        backHref="/admin/blog"
      />
      <div className="p-4 sm:p-6 lg:p-8 pb-32">
        <BlogPostForm />
      </div>
    </div>
  )
}
