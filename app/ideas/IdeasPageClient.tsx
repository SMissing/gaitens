'use client'

import { useEffect, useState } from 'react'
import { IdeasList } from '@/components/ideas/IdeasList'
import { IdeasSortFilter } from '@/components/ideas/IdeasSortFilter'
import { IdeaFormModal } from '@/components/ideas/IdeaFormModal'
import { PageHeader } from '@/components/layout/PageHeader'
import { Lightbulb, Plus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { Idea } from '@/types/database'
import { fetchWithAuth } from '@/lib/fetch-with-auth'

type SortOption = 'recent' | 'most_liked' | 'most_disliked' | 'oldest'
type FilterOption = 'All' | 'Garrison' | 'Spirits' | 'Bassment'

export default function IdeasPageClient() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [filterBy, setFilterBy] = useState<FilterOption>('All')
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const response = await fetchWithAuth('/api/ideas')
        const data = await response.json()
        if (data.ideas) {
          setIdeas(data.ideas)
        }
      } catch (error) {
        console.error('Failed to fetch ideas:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchIdeas()
  }, [])

  // "Live feed" MVP for ideas: poll on an interval while the tab is visible.
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return
      if (isModalOpen) return
      setRefreshKey((prev) => prev + 1)
    }, 8000)
    return () => clearInterval(interval)
  }, [isModalOpen])

  const handleIdeaSubmitted = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Ideas"
        icon={<Lightbulb className="h-6 w-6 text-spirits-yellow" />}
        description="Share your ideas to help improve our businesses"
      />
      <div className="p-4 sm:p-6 lg:p-8 pb-32">
        <div className="max-w-4xl mx-auto">
          {/* Submit Idea Button */}
          <div className="mb-6 flex justify-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="relative flex flex-col items-center justify-center gap-2 w-96 h-24 rounded-2xl transition-all active:scale-95 touch-manipulation overflow-hidden group"
              style={{
                background:
                  'linear-gradient(to right, oklch(0.5500 0.2000 50), oklch(0.9500 0.2000 100), oklch(0.6500 0.3000 320))',
                padding: '2px',
              }}
            >
              <div className="w-full h-full bg-[#1e1e1e] group-hover:bg-[#262626] rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors">
                <Plus className="h-8 w-8 text-foreground" />
                <span className="text-xs text-muted-foreground">Submit an Idea</span>
              </div>
            </button>
          </div>

          {/* Ideas List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                All Ideas
                <span className="text-xs px-2 py-1 rounded-full border border-spirits-magenta/30 bg-spirits-magenta/10 text-spirits-magenta">
                  Live
                </span>
              </h2>
              <IdeasSortFilter
                currentSort={sortBy}
                currentFilter={filterBy}
                onSortChange={setSortBy}
                onFilterChange={setFilterBy}
              />
            </div>
            {loading ? (
              <Card className="bg-[#1e1e1e] rounded-2xl border border-border/50">
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">Loading ideas...</p>
                </div>
              </Card>
            ) : (
              <IdeasList
                initialIdeas={ideas as any}
                refreshKey={refreshKey}
                sortBy={sortBy}
                filterBy={filterBy}
              />
            )}
          </div>
        </div>
      </div>

      <IdeaFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onIdeaSubmitted={handleIdeaSubmitted}
      />
    </div>
  )
}
