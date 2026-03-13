'use client'

import { useEffect, useState } from 'react'
import { InstagramCarousel } from './InstagramCarousel'

interface InstagramPost {
  id: string
  permalink: string
  media_url?: string
  thumbnail_url?: string
  caption?: string
  timestamp?: string
  username: string
}

interface InstagramAccount {
  username: string
  displayName: string
  posts: InstagramPost[]
}

export function InstagramFeed() {
  const [accounts, setAccounts] = useState<InstagramAccount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchInstagramData() {
      try {
        const response = await fetch('/api/instagram')
        const data = await response.json()
        setAccounts(data.accounts || [])
      } catch (error) {
        console.error('Error fetching Instagram data:', error)
        setAccounts([])
      } finally {
        setLoading(false)
      }
    }

    fetchInstagramData()
  }, [])

  if (loading) {
    return (
      <div className="bg-[#1e1e1e]/60 backdrop-blur-md rounded-2xl border border-border/30 shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="flex gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-[280px] h-[280px] bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (accounts.length === 0) {
    return null
  }

  return <InstagramCarousel accounts={accounts} />
}
