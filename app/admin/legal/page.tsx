import { redirect } from 'next/navigation'

/** Old URL — use `/admin/bardisc` */
export default function AdminLegalRedirectPage() {
  redirect('/admin/bardisc')
}
