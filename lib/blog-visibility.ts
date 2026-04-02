import type { BlogPost, UserRole } from '@/types/database'

type VisibilityFields = Pick<
  BlogPost,
  'visibleToStaff' | 'visibleToManager' | 'visibleToAdmin'
>

/** Whether the viewer’s role is allowed to see this post on the public blog (when published). */
export function userCanSeeBlogPost(role: UserRole, post: VisibilityFields): boolean {
  const staff = post.visibleToStaff ?? true
  const mgr = post.visibleToManager ?? true
  const adm = post.visibleToAdmin ?? true
  if (role === 'staff') return staff
  if (role === 'manager') return mgr
  if (role === 'admin') return adm
  return false
}

export function hasAtLeastOneAudience(v: VisibilityFields): boolean {
  const a = v.visibleToStaff ?? true
  const b = v.visibleToManager ?? true
  const c = v.visibleToAdmin ?? true
  return a || b || c
}
