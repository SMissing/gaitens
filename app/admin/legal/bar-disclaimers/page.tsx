import { redirect } from 'next/navigation'

/** Old URL — keep redirect for bookmarks / shared links */
export default function BarDisclaimersRedirectPage() {
  redirect('/admin/bardisc')
}
