'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { User } from '@/types/database'
import { X, Loader2, Calendar } from 'lucide-react'

interface AddHolidayFormProps {
  onSuccess: () => void
  onClose: () => void
}

export function AddHolidayForm({ onSuccess, onClose }: AddHolidayFormProps) {
  const [staff, setStaff] = useState<User[]>([])
  const [selectedStaffId, setSelectedStaffId] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [reason, setReason] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [fetchingStaff, setFetchingStaff] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    try {
      setFetchingStaff(true)
      const response = await fetch('/api/staff?active=true')
      if (!response.ok) {
        throw new Error('Failed to fetch staff')
      }
      const data = await response.json()
      setStaff(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load staff')
    } finally {
      setFetchingStaff(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!selectedStaffId) {
        throw new Error('Please select a staff member')
      }

      if (!startDate || !endDate) {
        throw new Error('Please select both start and end dates')
      }

      const start = new Date(startDate)
      const end = new Date(endDate)

      if (end < start) {
        throw new Error('End date must be after start date')
      }

      const response = await fetch('/api/holidays/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedStaffId,
          startDate,
          endDate,
          reason: reason || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add holiday')
      }

      // Reset form
      setSelectedStaffId('')
      setStartDate('')
      setEndDate('')
      setReason('')
      
      // Trigger success callback
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add holiday')
    } finally {
      setLoading(false)
    }
  }

  // Set today as minimum date
  const today = new Date().toISOString().split('T')[0]

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Add Holiday</CardTitle>
            <CardDescription>Directly log a holiday for a staff member</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Staff Member Selection */}
          <div>
            <Label htmlFor="staff">Staff Member *</Label>
            {fetchingStaff ? (
              <div className="mt-2 text-sm text-muted-foreground">Loading staff...</div>
            ) : (
              <div className="mt-2">
                <Select
                  id="staff"
                  options={[
                    { value: '', label: 'Select a staff member...' },
                    ...staff.map((member) => ({
                      value: member.id,
                      label: `${member.name} (${member.staffCode})${member.site ? ` - ${member.site}` : ''}`,
                    })),
                  ]}
                  value={selectedStaffId}
                  onChange={(value) => setSelectedStaffId(value)}
                  placeholder="Select a staff member..."
                  required
                  disabled={loading}
                />
              </div>
            )}
          </div>

          {/* Start Date */}
          <div>
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={today}
              required
              className="mt-2"
            />
          </div>

          {/* End Date */}
          <div>
            <Label htmlFor="endDate">End Date *</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || today}
              required
              className="mt-2"
            />
          </div>

          {/* Reason */}
          <div>
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Input
              id="reason"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Annual leave, Personal time"
              className="mt-2"
            />
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded p-2">
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading || fetchingStaff} className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding Holiday...
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                Add Holiday
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
