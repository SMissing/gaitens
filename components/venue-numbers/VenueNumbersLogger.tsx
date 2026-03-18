'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Loader2, MapPin } from 'lucide-react'

type Venue = 'Garrison' | 'Spirits' | 'Bassment'

type MyEntry = {
  id: string
  venue: Venue
  numbers: string
  created_at: string
}

const venueOptions = [
  { value: 'Garrison', label: 'Garrison' },
  { value: 'Spirits', label: 'Spirits' },
  { value: 'Bassment', label: 'Bassment' },
]

function formatTimeAgo(iso: string) {
  const d = new Date(iso)
  const diffMs = Date.now() - d.getTime()
  const sec = Math.floor(diffMs / 1000)

  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 48) return `${hr}h ago`

  const days = Math.floor(hr / 24)
  return `${days}d ago`
}

export function VenueNumbersLogger() {
  const [venue, setVenue] = useState<Venue>('Garrison')
  const [numbers, setNumbers] = useState('')
  const [entries, setEntries] = useState<MyEntry[]>([])
  const [loadingEntries, setLoadingEntries] = useState(true)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const fetchMine = async () => {
    setLoadingEntries(true)
    try {
      const res = await fetch('/api/venue-numbers?limit=5')
      if (!res.ok) return
      const json = await res.json()
      setEntries(json.entries || [])
    } catch {
      // ignore - best effort
    } finally {
      setLoadingEntries(false)
    }
  }

  useEffect(() => {
    fetchMine()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const trimmed = numbers.trim()
    if (!trimmed) {
      setError('Enter venue numbers (can be a shorthand like “8157”).')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/venue-numbers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ venue, numbers: trimmed }),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => null)
        setError(json?.error || 'Failed to submit entry')
        return
      }

      setSuccess('Submitted.')
      setNumbers('')
      await fetchMine()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="bg-[#1e1e1e] rounded-2xl border border-border/50">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 text-foreground">
                <MapPin className="h-5 w-5 text-spirits-magenta" />
                <h2 className="text-lg font-semibold">Log Venue Numbers</h2>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Use this to record when you share venue numbers with the team.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">Venue</label>
                <div className="mt-1">
                  <Select
                    options={venueOptions}
                    value={venue}
                    onChange={(v) => setVenue(v as Venue)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Numbers</label>
                <div className="mt-1">
                  <Input
                    value={numbers}
                    onChange={(e) => setNumbers(e.target.value)}
                    placeholder="e.g. 8157 / 3514 / ‘busy’"
                    maxLength={50}
                    required
                  />
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-green-500">{success}</p>}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-spirits-magenta to-spirits-magenta/80 hover:from-spirits-magenta/90 hover:to-spirits-magenta text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-[#1e1e1e] rounded-2xl border border-border/50">
        <CardContent className="p-4 sm:p-6">
          <h3 className="text-base font-semibold text-foreground mb-3">Recent submissions</h3>

          {loadingEntries ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : entries.length === 0 ? (
            <div className="text-sm text-muted-foreground">No entries yet.</div>
          ) : (
            <div className="space-y-2">
              {entries.map((e) => {
                const when = e.created_at ? formatTimeAgo(e.created_at) : ''
                return (
                  <div
                    key={e.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border/50 bg-background/20"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate">{e.venue}</div>
                      <div className="text-sm text-muted-foreground truncate">{e.numbers}</div>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">{when}</div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

