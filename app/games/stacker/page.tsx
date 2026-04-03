import type { Metadata } from 'next'
import { requireAuth } from '@/lib/auth'
import { StackerScreen } from '@/components/games/StackerScreen'

export const metadata: Metadata = {
  title: 'Stacker',
  description: 'Stack moving blocks to the top — training checkpoints every few stacks.',
}

export default async function StackerPage() {
  const user = await requireAuth()
  return <StackerScreen currentUserId={user.id} />
}
