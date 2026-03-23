import { requireAuth } from '@/lib/auth'
import IdeasPageClient from './IdeasPageClient'

export default async function IdeasPage() {
  await requireAuth()
  return <IdeasPageClient />
}
