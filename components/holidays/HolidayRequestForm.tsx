'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toYyyyMmDdLocal } from '@/lib/date-utils'
import { X } from 'lucide-react'

interface HolidayRequestFormProps {
  selectedStartDate: Date | null
  selectedEndDate: Date | null
  onSuccess?: () => void
  onClear?: () => void
}

export function HolidayRequestForm({ 
  selectedStartDate, 
  selectedEndDate,
  onSuccess,
  onClear
}: HolidayRequestFormProps) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedStartDate || !selectedEndDate) {
      setError('Please select a date range')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/holidays/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: toYyyyMmDdLocal(selectedStartDate),
          endDate: toYyyyMmDdLocal(selectedEndDate),
          reason: reason || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request')
      }

      // Reset form
      setReason('')
      setError(null)
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit request')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  if (!selectedStartDate || !selectedEndDate) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Request Time Off</CardTitle>
          <CardDescription>
            Select a date range on the calendar to request time off
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle>Request Time Off</CardTitle>
            <CardDescription>
              {selectedStartDate.toDateString() === selectedEndDate.toDateString()
                ? `Requesting time off for ${formatDate(selectedStartDate)}`
                : `Requesting time off from ${formatDate(selectedStartDate)} to ${formatDate(selectedEndDate)}`}
            </CardDescription>
          </div>
          {onClear && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClear}
              className="h-8 w-8"
              aria-label="Clear selection"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Family holiday, Personal time"
              className="mt-1"
            />
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded p-2">
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
