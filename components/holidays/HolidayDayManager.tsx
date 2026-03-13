'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/date-utils'
import type { HolidayRequest } from '@/types/database'
import type { User } from '@/types/database'
import { X, Trash2, Loader2, Settings } from 'lucide-react'

interface ApprovedHolidayRequest extends HolidayRequest {
  users: User | User[] | null
}

interface HolidayDayManagerProps {
  date: Date
  onUpdate: () => void
  onClose: () => void
  onEditAvailability?: () => void
}

export function HolidayDayManager({ date, onUpdate, onClose, onEditAvailability }: HolidayDayManagerProps) {
  const [holidays, setHolidays] = useState<ApprovedHolidayRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchHolidays()
  }, [date])

  const fetchHolidays = async () => {
    try {
      setLoading(true)
      const dateStr = date.toISOString().split('T')[0]
      // Fetch a wider range to ensure we get all holidays that might cover this date
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0]
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0]
      const response = await fetch(`/api/holidays/approved?startDate=${startOfMonth}&endDate=${endOfMonth}`, {
        cache: 'no-store',
      })
      
      if (response.ok) {
        const data: ApprovedHolidayRequest[] = await response.json()
        // Filter to only include holidays that cover this specific date
        const dayHolidays = data.filter(req => {
          const start = new Date(req.startDate)
          start.setHours(0, 0, 0, 0)
          const end = new Date(req.endDate)
          end.setHours(23, 59, 59, 999)
          const checkDate = new Date(date)
          checkDate.setHours(0, 0, 0, 0)
          return checkDate >= start && checkDate <= end
        })
        setHolidays(dayHolidays)
      } else {
        const errorData = await response.json()
        console.error('Error fetching holidays:', errorData)
        setError('Failed to load holidays')
      }
    } catch (err) {
      console.error('Error fetching holidays:', err)
      setError('Failed to load holidays')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveHoliday = async (holidayId: string) => {
    if (!confirm('Are you sure you want to remove this holiday? The request will be marked as rejected.')) {
      return
    }

    setDeletingId(holidayId)
    setError(null)

    try {
      console.log('Deleting holiday:', holidayId)
      const response = await fetch(`/api/holidays/requests/${holidayId}/cancel`, {
        method: 'DELETE',
        cache: 'no-store',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Delete failed:', response.status, errorData)
        throw new Error(errorData.error || 'Failed to remove holiday')
      }

      // Remove from local state immediately for better UX
      setHolidays(prev => prev.filter(h => h.id !== holidayId))
      
      const responseData = await response.json()
      console.log('Reject response:', response.status, responseData)
      console.log('Rejected holiday ID:', responseData.updatedId)

      // Trigger parent update to refresh calendar immediately
      // This will increment refreshKey and remount the calendar component
      onUpdate()
      
      // Also refetch holidays in this component after a delay to verify deletion
      setTimeout(() => {
        fetchHolidays()
      }, 1000)
    } catch (err) {
      console.error('Error removing holiday:', err)
      setError(err instanceof Error ? err.message : 'Failed to remove holiday')
      // Restore the holiday in local state if deletion failed
      fetchHolidays()
    } finally {
      setDeletingId(null)
    }
  }

  const formatDateDisplay = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Manage Holidays</CardTitle>
              <CardDescription>{formatDateDisplay(date)}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
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
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Manage Holidays</CardTitle>
            <CardDescription>{formatDateDisplay(date)}</CardDescription>
          </div>
          <div className="flex gap-2">
            {onEditAvailability && (
              <Button variant="ghost" size="sm" onClick={onEditAvailability} title="Edit day availability">
                <Settings className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded p-2">
            {error}
          </div>
        )}

        {holidays.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No approved holidays for this day</p>
          </div>
        ) : (
          <div className="space-y-3">
            {holidays.map((holiday) => {
              // Handle both array and object formats from Supabase
              const userData = Array.isArray(holiday.users) ? holiday.users[0] : holiday.users
              const user = userData as User | null
              const isDeleting = deletingId === holiday.id

              return (
                <div
                  key={holiday.id}
                  className="flex items-start justify-between p-3 border border-border rounded-lg bg-card/50"
                >
                  <div className="flex-1">
                    <div className="font-medium text-foreground">
                      {user?.name || 'Unknown User'} ({user?.staffCode || 'N/A'})
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {formatDate(holiday.startDate)} - {formatDate(holiday.endDate)}
                    </div>
                    {holiday.reason && (
                      <div className="text-xs text-muted-foreground mt-1 italic">
                        {holiday.reason}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveHoliday(holiday.id)}
                    disabled={isDeleting}
                    className="ml-3"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Removing...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </>
                    )}
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
