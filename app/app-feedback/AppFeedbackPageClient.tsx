'use client'

import { useEffect, useState } from 'react'
import { AppFeedbackList } from '@/components/app-feedback/AppFeedbackList'
import { AppFeedbackFormModal } from '@/components/app-feedback/AppFeedbackFormModal'
import { PageHeader } from '@/components/layout/PageHeader'
import { TabletSmartphone } from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { AppFeedback } from '@/types/database'
import { fetchWithAuth } from '@/lib/fetch-with-auth'

type SortOption = 'recent' | 'oldest'
type FilterOption = 'All' | 'feature' | 'issue' | 'question'

const SORT_OPTIONS: SortOption[] = ['recent', 'oldest']
const FILTER_OPTIONS: FilterOption[] = ['All', 'feature', 'issue', 'question']

interface AppFeedbackPageClientProps {
  canReplyAsIT: boolean
}

export default function AppFeedbackPageClient({ canReplyAsIT }: AppFeedbackPageClientProps) {
  const [items, setItems] = useState<AppFeedback[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [filterBy, setFilterBy] = useState<FilterOption>('All')
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetchWithAuth('/api/app-feedback')
        const data = await response.json()
        if (data.items) {
          setItems(data.items)
        }
      } catch (e) {
        console.error('Failed to fetch app feedback', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    document.body.classList.add('ideas-page-font')
    return () => {
      document.body.classList.remove('ideas-page-font')
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return
      if (isModalOpen) return
      setRefreshKey((k) => k + 1)
    }, 8000)
    return () => clearInterval(interval)
  }, [isModalOpen])

  useEffect(() => {
    const openModal = () => setIsModalOpen(true)
    const onSort = (event: Event) => {
      const ce = event as CustomEvent<{ sort?: SortOption }>
      const s = ce.detail?.sort
      if (s && SORT_OPTIONS.includes(s)) setSortBy(s)
    }
    const onFilter = (event: Event) => {
      const ce = event as CustomEvent<{ filter?: FilterOption }>
      const f = ce.detail?.filter
      if (f && FILTER_OPTIONS.includes(f)) setFilterBy(f)
    }

    window.addEventListener('app-feedback:open-modal', openModal as EventListener)
    window.addEventListener('app-feedback:set-sort', onSort as EventListener)
    window.addEventListener('app-feedback:set-filter', onFilter as EventListener)
    return () => {
      window.removeEventListener('app-feedback:open-modal', openModal as EventListener)
      window.removeEventListener('app-feedback:set-sort', onSort as EventListener)
      window.removeEventListener('app-feedback:set-filter', onFilter as EventListener)
    }
  }, [])

  const handleSubmitted = () => {
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="App feedback"
        icon={<TabletSmartphone className="h-6 w-6 text-spirits-cyan" />}
        description="Ideas, issues, and questions about this app — visible to the team"
      />
      <div className="p-4 sm:p-6 lg:p-8 pb-32">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <Card className="bg-[#1e1e1e] rounded-2xl border border-border/50">
              <div className="p-8 text-center">
                <p className="text-muted-foreground">Loading…</p>
              </div>
            </Card>
          ) : (
            <AppFeedbackList
              initialItems={items}
              refreshKey={refreshKey}
              sortBy={sortBy}
              filterBy={filterBy}
              canReplyAsIT={canReplyAsIT}
            />
          )}
        </div>
      </div>

      <AppFeedbackFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitted={handleSubmitted}
      />
    </div>
  )
}
