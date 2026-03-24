'use client'

import { useEffect, useState } from 'react'
import { IdeasList } from '@/components/ideas/IdeasList'
import { IdeaFormModal } from '@/components/ideas/IdeaFormModal'
import { PageHeader } from '@/components/layout/PageHeader'
import { Lightbulb } from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { Idea } from '@/types/database'
import { fetchWithAuth } from '@/lib/fetch-with-auth'

type SortOption = 'recent' | 'most_liked' | 'most_disliked' | 'oldest'
type FilterOption = 'All' | 'Garrison' | 'Spirits' | 'Bassment'
const SORT_OPTIONS: SortOption[] = ['recent', 'most_liked', 'most_disliked', 'oldest']
const FILTER_OPTIONS: FilterOption[] = ['All', 'Garrison', 'Spirits', 'Bassment']

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

  useEffect(() => {
    document.body.classList.add('ideas-page-font')
    return () => {
      document.body.classList.remove('ideas-page-font')
    }
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

  useEffect(() => {
    const handleOpenModal = () => setIsModalOpen(true)
    const handleSetSort = (event: Event) => {
      const customEvent = event as CustomEvent<{ sort?: SortOption }>
      const nextSort = customEvent.detail?.sort
      if (nextSort && SORT_OPTIONS.includes(nextSort)) {
        setSortBy(nextSort)
      }
    }
    const handleSetFilter = (event: Event) => {
      const customEvent = event as CustomEvent<{ filter?: FilterOption }>
      const nextFilter = customEvent.detail?.filter
      if (nextFilter && FILTER_OPTIONS.includes(nextFilter)) {
        setFilterBy(nextFilter)
      }
    }

    window.addEventListener('ideas:open-modal', handleOpenModal as EventListener)
    window.addEventListener('ideas:set-sort', handleSetSort as EventListener)
    window.addEventListener('ideas:set-filter', handleSetFilter as EventListener)

    return () => {
      window.removeEventListener('ideas:open-modal', handleOpenModal as EventListener)
      window.removeEventListener('ideas:set-sort', handleSetSort as EventListener)
      window.removeEventListener('ideas:set-filter', handleSetFilter as EventListener)
    }
  }, [])

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
          {/* Ideas List */}
          <div>
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
