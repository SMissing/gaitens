import { createServerClient } from '@/lib/db'

/** Resolves slug collisions by appending -1, -2, … Optional excludeId for updates. */
export async function ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
  const supabase = createServerClient()
  let slug = baseSlug
  let n = 0
  while (n < 100) {
    const { data } = await supabase.from('blog_posts').select('id').eq('slug', slug).maybeSingle()
    if (!data) return slug
    if (excludeId && data.id === excludeId) return slug
    n += 1
    slug = `${baseSlug}-${n}`
  }
  return `${baseSlug}-${Date.now()}`
}
