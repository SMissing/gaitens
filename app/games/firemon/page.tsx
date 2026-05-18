import type { Metadata } from 'next'
import { requireAuth } from '@/lib/auth'
import { FiremonScreen } from '@/components/games/FiremonScreen'

export const metadata: Metadata = {
  title: 'Firemon',
  description:
    'Match extinguishers to fire types — Pokémon-style training for fire safety.',
}

export default async function FiremonPage() {
  const user = await requireAuth()
  return <FiremonScreen currentUserId={user.id} />
}
