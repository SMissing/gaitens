'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import type { BarredPerson } from '@/types/database'
import { BarredPersonForm } from './BarredPersonForm'
import { BarredPersonModal } from './BarredPersonModal'
import { Button } from '@/components/ui/button'
import { Plus, RefreshCcw, X } from 'lucide-react'

interface BarredListClientProps {
  initialPeople: BarredPerson[]
}

export function BarredListClient({ initialPeople }: BarredListClientProps) {
  const [people, setPeople] = useState<BarredPerson[]>(initialPeople)
  const [loading, setLoading] = useState(initialPeople.length === 0)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<BarredPerson | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [activeView, setActiveView] = useState<'active' | 'past'>('active')
  const touchStartXRef = useRef<number | null>(null)
  const touchStartYRef = useRef<number | null>(null)

  const activeBars = useMemo(() => {
    const now = Date.now()
    return people.filter((p) => new Date(p.barEndDate).getTime() > now)
  }, [people])

  const pastBars = useMemo(() => {
    const now = Date.now()
    return people.filter((p) => new Date(p.barEndDate).getTime() <= now)
  }, [people])

  const visiblePeople = activeView === 'active' ? activeBars : pastBars

  const fetchPeople = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/barred')
      if (!response.ok) throw new Error('Failed to fetch barred list.')
      const data: BarredPerson[] = await response.json()
      setPeople(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch barred list.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialPeople.length === 0) fetchPeople()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!showAddModal) return

    const previousOverflow = document.body.style.overflow
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowAddModal(false)
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [showAddModal])

  const handleCreated = async () => {
    await fetchPeople()
    setActiveView('active')
    setShowAddModal(false)
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const t = e.changedTouches[0]
    touchStartXRef.current = t.clientX
    touchStartYRef.current = t.clientY
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return

    const t = e.changedTouches[0]
    const deltaX = t.clientX - touchStartXRef.current
    const deltaY = t.clientY - touchStartYRef.current

    // Treat as horizontal swipe only if horizontal movement dominates and is large enough.
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0 && activeView === 'active') {
        // Swipe left -> Past Bars
        setActiveView('past')
      } else if (deltaX > 0 && activeView === 'past') {
        // Swipe right -> Active Barred List
        setActiveView('active')
      }
    }

    touchStartXRef.current = null
    touchStartYRef.current = null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-foreground">
          {activeView === 'active' ? 'Barred List' : 'Past Bars'}
        </h3>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="touch-manipulation"
          >
            <Plus className="h-4 w-4" />
            ADD BAR
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchPeople()}
            disabled={loading}
            className="touch-manipulation"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={activeView === 'active' ? 'default' : 'outline'}
          onClick={() => setActiveView('active')}
          className="touch-manipulation"
        >
          Barred List
        </Button>
        <Button
          size="sm"
          variant={activeView === 'past' ? 'default' : 'outline'}
          onClick={() => setActiveView('past')}
          className="touch-manipulation"
        >
          Past Bars
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : visiblePeople.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {activeView === 'active' ? 'No barred people yet.' : 'No past bars yet.'}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {visiblePeople.map((person) => (
              <div
                key={person.id}
                className="group cursor-pointer rounded-xl overflow-hidden border border-border/30 bg-card/40 hover:border-spirits-magenta/60 transition-colors"
                onClick={() => setSelected(person)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setSelected(person)
                }}
                aria-label={`Open barred person ${person.name || 'Unnamed'}`}
              >
                <div className="relative aspect-square bg-muted">
                  {person.imageUrl ? (
                    <Image
                      src={person.imageUrl}
                      alt={person.name || 'Barred person photo'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>

                <div className="p-2">
                  <div className="font-semibold text-sm text-foreground truncate">
                    {person.name || 'Unnamed'}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    Length: {person.barDurationValue} {person.barDurationUnit}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <BarredPersonModal
          person={selected}
          onClose={() => setSelected(null)}
        />
      )}

      {showAddModal && (
        <div
          className="fixed inset-0 z-[100] bg-black"
          role="dialog"
          aria-modal="true"
          aria-label="Add barred person"
        >
          <div
            className="h-full w-full overflow-y-auto"
            style={{
              paddingTop: 'env(safe-area-inset-top, 0px)',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 sm:p-6 border-b border-border/50 bg-black">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Add Bar</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAddModal(false)}
                aria-label="Close add bar modal"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
              <BarredPersonForm onCreated={handleCreated} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

