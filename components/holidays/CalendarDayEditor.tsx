'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { HolidayCalendarAvailability } from '@/types/database'

interface CalendarDayEditorProps {
  date: Date
  onUpdate: () => void
}

export function CalendarDayEditor({ date, onUpdate }: CalendarDayEditorProps) {
  const [status, setStatus] = useState<'green' | 'yellow' | 'red'>('green')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchCurrentStatus()
  }, [date])

  const fetchCurrentStatus = async () => {
    try {
      setFetching(true)
      const dateStr = date.toISOString().split('T')[0]
      const response = await fetch(`/api/holidays/calendar?startDate=${dateStr}&endDate=${dateStr}`)
      
      if (response.ok) {
        const data: HolidayCalendarAvailability[] = await response.json()
        if (data.length > 0) {
          setStatus(data[0].status)
          setNotes(data[0].notes || '')
        } else {
          setStatus('green')
          setNotes('')
        }
      }
    } catch (err) {
      console.error('Error fetching current status:', err)
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const dateStr = date.toISOString().split('T')[0]
      const response = await fetch(`/api/holidays/calendar/${dateStr}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          notes: notes || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update calendar day')
      }

      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onUpdate()
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update calendar day')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  if (fetching) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Update Calendar Day</CardTitle>
          <CardDescription>{formatDate(date)}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Calendar Day</CardTitle>
        <CardDescription>{formatDate(date)}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="status">Availability Status</Label>
            <div className="mt-2 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="green"
                  checked={status === 'green'}
                  onChange={(e) => setStatus(e.target.value as 'green')}
                  className="w-4 h-4"
                />
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-500/30 border border-green-500/50" />
                  <span>Available (Green)</span>
                </div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="yellow"
                  checked={status === 'yellow'}
                  onChange={(e) => setStatus(e.target.value as 'yellow')}
                  className="w-4 h-4"
                />
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-yellow-500/40 border border-yellow-500/50" />
                  <span>Limited Availability (Yellow)</span>
                </div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="red"
                  checked={status === 'red'}
                  onChange={(e) => setStatus(e.target.value as 'red')}
                  className="w-4 h-4"
                />
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-500/40 border border-red-500/50" />
                  <span>Unavailable (Red)</span>
                </div>
              </label>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Bank holiday, Event day"
              className="mt-1"
            />
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded p-2">
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-green-500 bg-green-500/10 border border-green-500/20 rounded p-2">
              Calendar day updated successfully!
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Updating...' : 'Update Day'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
