'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { GlowEffect } from '@/components/ui/glow-effect'
import { fetchWithAuth } from '@/lib/fetch-with-auth'
import type {
  AppFeedback,
  AppFeedbackAdminStatus,
  AppFeedbackCategory,
} from '@/types/database'

type SortOption = 'recent' | 'oldest'
type FilterOption = 'All' | AppFeedbackCategory

interface AppFeedbackListProps {
  initialItems: AppFeedback[]
  refreshKey?: number
  sortBy?: SortOption
  filterBy?: FilterOption
  canReplyAsIT: boolean
}

function categoryLabel(c: AppFeedbackCategory): string {
  switch (c) {
    case 'feature':
      return 'Feature'
    case 'issue':
      return 'Issue'
    case 'question':
      return 'Question'
    default:
      return c
  }
}

function statusLabel(s: AppFeedbackAdminStatus): string {
  switch (s) {
    case 'open':
      return 'Open'
    case 'denied':
      return 'Denied'
    case 'working_on_it':
      return 'Working on it'
    case 'completed':
      return 'Completed'
    default:
      return s
  }
}

function statusBadgeClass(s: AppFeedbackAdminStatus): string {
  switch (s) {
    case 'denied':
      return 'bg-red-500/15 text-red-400 border-red-500/30'
    case 'working_on_it':
      return 'bg-amber-500/15 text-amber-300 border-amber-500/30'
    case 'completed':
      return 'bg-green-500/15 text-green-400 border-green-500/30'
    default:
      return 'bg-muted/40 text-muted-foreground border-border/60'
  }
}

function getCategoryGlowColors(category: AppFeedbackCategory): string[] {
  switch (category) {
    case 'feature':
      return ['#eab308', '#facc15', '#fde047']
    case 'issue':
      return ['#f97316', '#fb923c', '#fdba74']
    case 'question':
      return ['#22d3ee', '#67e8f9', '#a5f3fc']
    default:
      return ['#71717a', '#a1a1aa', '#71717a']
  }
}

export function AppFeedbackList({
  initialItems,
  refreshKey,
  sortBy = 'recent',
  filterBy = 'All',
  canReplyAsIT,
}: AppFeedbackListProps) {
  const [items, setItems] = useState<AppFeedback[]>(initialItems)
  const [loading, setLoading] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<
    Record<string, { adminStatus: AppFeedbackAdminStatus; adminComment: string }>
  >({})

  const filteredAndSorted = useMemo(() => {
    let list = filterBy === 'All' ? items : items.filter((i) => i.category === filterBy)
    list = [...list].sort((a, b) => {
      const ta = new Date(a.createdAt).getTime()
      const tb = new Date(b.createdAt).getTime()
      return sortBy === 'oldest' ? ta - tb : tb - ta
    })
    return list
  }, [items, sortBy, filterBy])

  useEffect(() => {
    const refresh = async () => {
      setLoading(true)
      try {
        const response = await fetchWithAuth('/api/app-feedback')
        const data = await response.json()
        if (data.items) {
          setItems(data.items)
        }
      } catch (e) {
        console.error('Failed to refresh app feedback', e)
      } finally {
        setLoading(false)
      }
    }

    if (refreshKey !== undefined && refreshKey > 0) {
      refresh()
    }
  }, [refreshKey])

  const saveAdmin = async (id: string) => {
    const row = items.find((i) => i.id === id)
    if (!row) return
    const draft =
      drafts[id] ?? {
        adminStatus: row.adminStatus,
        adminComment: row.adminComment ?? '',
      }
    setSavingId(id)
    try {
      const response = await fetchWithAuth(`/api/app-feedback/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminStatus: draft.adminStatus,
          adminComment: draft.adminComment.trim() === '' ? null : draft.adminComment.trim(),
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Save failed')
      }
      if (data.item) {
        setItems((prev) => prev.map((row) => (row.id === id ? data.item : row)))
        setDrafts((prev) => {
          const next = { ...prev }
          delete next[id]
          return next
        })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSavingId(null)
    }
  }

  if (filteredAndSorted.length === 0 && !loading) {
    return (
      <Card className="bg-[#1e1e1e] rounded-2xl border border-border/50">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">
            No submissions yet. Share feedback about the app using the + button below.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {loading && (
        <p className="text-center text-sm text-muted-foreground">Updating list…</p>
      )}
      {filteredAndSorted.map((item) => {
        const draft =
          drafts[item.id] ?? {
            adminStatus: item.adminStatus,
            adminComment: item.adminComment ?? '',
          }
        return (
          <Card
            key={item.id}
            className="relative overflow-hidden rounded-2xl border border-transparent bg-[#1e1e1e]"
          >
            <GlowEffect
              colors={getCategoryGlowColors(item.category)}
              mode="rotate"
              blur="strong"
              duration={6}
              scale={1.06}
              className="opacity-80"
            />
            <div className="pointer-events-none absolute inset-[2px] z-0 rounded-[calc(1rem-2px)] bg-[#1e1e1e]" />
            <CardContent className="relative z-10 p-4 sm:p-6 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground flex-1 min-w-0">
                  {item.title}
                </h3>
                <span
                  className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${statusBadgeClass(item.adminStatus)}`}
                >
                  {statusLabel(item.adminStatus)}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground/90">{categoryLabel(item.category)}</span>
                <span aria-hidden>·</span>
                <time dateTime={item.createdAt}>
                  {new Date(item.createdAt).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </time>
                {item.submitterName ? (
                  <>
                    <span aria-hidden>·</span>
                    <span>{item.submitterName}</span>
                  </>
                ) : null}
              </div>

              <p className="text-foreground whitespace-pre-wrap">{item.description}</p>

              {item.adminComment ? (
                <div className="rounded-xl border border-spirits-cyan/25 bg-spirits-cyan/5 px-3 py-2 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-spirits-cyan/90 mb-1">
                    IT Reply
                  </p>
                  <p className="text-foreground/95 whitespace-pre-wrap">{item.adminComment}</p>
                </div>
              ) : null}

              {canReplyAsIT ? (
                <div className="pt-3 border-t border-border/50 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Update feedback
                  </p>
                  <div>
                    <Label htmlFor={`status-${item.id}`} className="text-xs">
                      Status
                    </Label>
                    <Select
                      id={`status-${item.id}`}
                      value={draft.adminStatus}
                      onChange={(value) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [item.id]: {
                            adminStatus: value as AppFeedbackAdminStatus,
                            adminComment:
                              prev[item.id]?.adminComment ?? item.adminComment ?? '',
                          },
                        }))
                      }
                      options={[
                        { value: 'open', label: 'Open' },
                        { value: 'working_on_it', label: 'Working on it' },
                        { value: 'completed', label: 'Completed' },
                        { value: 'denied', label: 'Denied' },
                      ]}
                      placeholder="Status"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`comment-${item.id}`} className="text-xs">
                      Comment to team
                    </Label>
                    <Textarea
                      id={`comment-${item.id}`}
                      value={draft.adminComment}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [item.id]: {
                            adminStatus:
                              prev[item.id]?.adminStatus ?? item.adminStatus,
                            adminComment: e.target.value,
                          },
                        }))
                      }
                      rows={3}
                      maxLength={2000}
                      placeholder="Optional note visible to everyone on this card…"
                      className="mt-1 resize-none text-sm"
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    disabled={savingId === item.id}
                    onClick={() => saveAdmin(item.id)}
                    className="rounded-xl"
                  >
                    {savingId === item.id ? 'Saving…' : 'Save response'}
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
