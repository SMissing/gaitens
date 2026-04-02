import type { Metadata } from 'next'
import { requireAuth } from '@/lib/auth'
import { BrickBreakerScreen } from '@/components/games/BrickBreakerScreen'

export const metadata: Metadata = {
  title: 'Brick Breaker',
  description: 'Staff brick breaker — climb ten levels and chase the team leaderboard.',
}

export default async function BrickBreakerPage() {
  const user = await requireAuth()
  return <BrickBreakerScreen currentUserId={user.id} />
}
