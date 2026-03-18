'use client'

import { useEffect, useMemo, useState } from 'react'
import { HolidayCalendar } from './HolidayCalendar'
import { CalendarDayEditor } from './CalendarDayEditor'
import { HolidayDayManager } from './HolidayDayManager'
import { AddHolidayForm } from './AddHolidayForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, X } from 'lucide-react'
import type { HolidayRequest, UserRole } from '@/types/database'
import { parseYyyyMmDdLocal, toYyyyMmDdLocal } from '@/lib/date-utils'

interface HolidaysClientProps {
  userRole: UserRole
}

export function HolidaysClient({ userRole }: HolidaysClientProps) {
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null)
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null)
  const [editingDate, setEditingDate] = useState<Date | null>(null)
  const [managingHolidaysDate, setManagingHolidaysDate] = useState<Date | null>(null)
  const [showAddHoliday, setShowAddHoliday] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Booking overlay state
  const [bookingMode, setBookingMode] = useState(false)
  const [requestReason, setRequestReason] = useState('')
  const [requestLoading, setRequestLoading] = useState(false)
  const [requestError, setRequestError] = useState<string | null>(null)

  // Overview data
  const [myRequests, setMyRequests] = useState<HolidayRequest[]>([])
  const [requestsLoading, setRequestsLoading] = useState(false)
  const [requestsError, setRequestsError] = useState<string | null>(null)

  const isAdmin = userRole === 'admin'
  const isManagerOrAdmin = userRole === 'manager' || userRole === 'admin'

  useEffect(() => {
    // Only staff and managers see their own summary here
    if (userRole === 'admin') return

    const fetchRequests = async () => {
      try {
        setRequestsLoading(true)
        setRequestsError(null)
        const res = await fetch('/api/holidays/requests', {
          cache: 'no-store',
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Failed to load your holiday requests')
        }
        const data: HolidayRequest[] = await res.json()
        setMyRequests(data || [])
      } catch (err) {
        setRequestsError(err instanceof Error ? err.message : 'Failed to load your holiday requests')
      } finally {
        setRequestsLoading(false)
      }
    }

    fetchRequests()
  }, [refreshKey, userRole])

  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const { upcomingApproved, pendingRequests } = useMemo(() => {
    const upcomingApproved = myRequests
      .filter((req) => {
        if (req.status !== 'approved') return false
        const end = parseYyyyMmDdLocal(req.endDate)
        end.setHours(0, 0, 0, 0)
        return end >= today
      })
      .sort((a, b) => parseYyyyMmDdLocal(a.startDate).getTime() - parseYyyyMmDdLocal(b.startDate).getTime())

    const pendingRequests = myRequests
      .filter((req) => req.status === 'pending')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return {
      upcomingApproved,
      pendingRequests,
    }
  }, [myRequests, today])

  const countDays = (start: string, end: string) => {
    const startDate = parseYyyyMmDdLocal(start)
    const endDate = parseYyyyMmDdLocal(end)
    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(0, 0, 0, 0)
    const diff = endDate.getTime() - startDate.getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1
  }

  const totalUpcomingDays = useMemo(
    () => upcomingApproved.reduce((sum, req) => sum + countDays(req.startDate, req.endDate), 0),
    [upcomingApproved]
  )

  const handleDateClick = (date: Date) => {
    if (isAdmin && !bookingMode) {
      // Admin management mode (outside booking overlay)
      setEditingDate(date)
      setManagingHolidaysDate(null)
      setSelectedStartDate(null)
      setSelectedEndDate(null)
    } else {
      // Booking mode selection (staff/managers/admins)
      if (selectedStartDate && date.toDateString() === selectedStartDate.toDateString()) {
        setSelectedStartDate(null)
        setSelectedEndDate(null)
        return
      }
      
      if (!selectedStartDate) {
        setSelectedStartDate(date)
        setSelectedEndDate(date)
      } else if (!selectedEndDate || date < selectedStartDate) {
        setSelectedStartDate(date)
        setSelectedEndDate(date)
      } else {
        setSelectedEndDate(date)
      }
    }
  }

  const handleRequestSuccess = () => {
    setSelectedStartDate(null)
    setSelectedEndDate(null)
    setRequestReason('')
    setRefreshKey(prev => prev + 1)
  }

  const handleEditorUpdate = () => {
    setEditingDate(null)
    setRefreshKey(prev => prev + 1)
  }

  const handleClearSelection = () => {
    setSelectedStartDate(null)
    setSelectedEndDate(null)
  }

  const formatDate = (dateStr: string) => {
    const date = parseYyyyMmDdLocal(dateStr)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatDisplayDate = (date: Date | null) => {
    if (!date) return 'Select a date'
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const canSubmitRequest = !!selectedStartDate && !!selectedEndDate && !requestLoading

  const handleSubmitRequest = async () => {
    if (!selectedStartDate || !selectedEndDate) {
      setRequestError('Please select a start and end date')
      return
    }

    try {
      setRequestLoading(true)
      setRequestError(null)
      const response = await fetch('/api/holidays/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: toYyyyMmDdLocal(selectedStartDate),
          endDate: toYyyyMmDdLocal(selectedEndDate),
          reason: requestReason || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request')
      }

      handleRequestSuccess()
      // Close booking mode after a successful request
      setBookingMode(false)
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : 'Failed to submit request')
    } finally {
      setRequestLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 space-y-6">
      {/* Holiday overview at the top */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        <Card className="lg:col-span-2 border-border/60 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base">
              {userRole === 'admin' ? 'Holiday Overview' : 'Your Holiday Overview'}
            </CardTitle>
            <CardDescription>
              {userRole === 'admin'
                ? 'Use the calendar tools to manage staff availability and holidays.'
                : 'Quick view of your upcoming holidays and any pending requests.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {userRole !== 'admin' ? (
              <>
                {requestsLoading ? (
                  <div className="text-sm text-muted-foreground">
                    Loading your holiday summary...
                  </div>
                ) : requestsError ? (
                  <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded p-2">
                    {requestsError}
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-4 items-baseline justify-between">
                      <div className="space-y-1">
                        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Upcoming approved days
                        </div>
                        <div className="text-2xl font-semibold">
                          {totalUpcomingDays}
                        </div>
                      </div>
                      <div className="space-y-1 min-w-[160px]">
                        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Pending requests
                        </div>
                        <div className="text-lg font-semibold">
                          {pendingRequests.length}
                        </div>
                      </div>
                    </div>

                    {upcomingApproved.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Next holidays
                        </div>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {upcomingApproved.slice(0, 4).map((req) => (
                            <div
                              key={req.id}
                              className="rounded-md border border-border/60 bg-background/60 px-3 py-2 text-xs flex items-center justify-between"
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {formatDate(req.startDate)}{req.startDate !== req.endDate ? ` – ${formatDate(req.endDate)}` : ''}
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                  {countDays(req.startDate, req.endDate)} day{countDays(req.startDate, req.endDate) !== 1 ? 's' : ''}
                                </span>
                              </div>
                              <span className="inline-flex items-center rounded-full bg-emerald-500/10 text-emerald-500 px-2 py-0.5 text-[11px]">
                                Approved
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {pendingRequests.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-border/40">
                        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Pending requests
                        </div>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {pendingRequests.slice(0, 4).map((req) => (
                            <div
                              key={req.id}
                              className="rounded-md border border-border/60 bg-background/60 px-3 py-2 text-xs flex items-center justify-between"
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {formatDate(req.startDate)}{req.startDate !== req.endDate ? ` – ${formatDate(req.endDate)}` : ''}
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                  Requested on{' '}
                                  {new Date(req.createdAt).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'short',
                                  })}
                                </span>
                              </div>
                              <span className="inline-flex items-center rounded-full bg-amber-500/10 text-amber-500 px-2 py-0.5 text-[11px]">
                                Pending
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                Open the booking view or use the calendar tools below to see and manage
                staff holidays and availability.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right-hand quick actions */}
        <div className="space-y-3">
          <Button
            variant="default"
            className="w-full h-12 text-sm font-medium"
            onClick={() => {
              setBookingMode(true)
              // Reset any previous selection for a fresh booking flow
              setSelectedStartDate(null)
              setSelectedEndDate(null)
              setRequestReason('')
              setRequestError(null)
            }}
          >
            Book time off
          </Button>
          {isAdmin && (
            <Button
              variant="outline"
              className="w-full h-12 text-sm font-medium"
              onClick={() => setShowAddHoliday(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add holiday for staff
            </Button>
          )}
        </div>
      </div>

      {/* Admin tools grid (calendar + side panel) */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <HolidayCalendar
              key={refreshKey}
              userRole={userRole}
              onDateClick={handleDateClick}
              onHolidayClick={(date) => {
                setManagingHolidaysDate(date)
                setEditingDate(null)
                setSelectedStartDate(null)
                setSelectedEndDate(null)
              }}
              selectedStartDate={selectedStartDate}
              selectedEndDate={selectedEndDate}
            />
          </div>

          <div className="space-y-6">
            {showAddHoliday && (
              <AddHolidayForm
                onSuccess={() => {
                  setShowAddHoliday(false)
                  setTimeout(() => {
                    setRefreshKey(prev => prev + 1)
                  }, 300)
                }}
                onClose={() => setShowAddHoliday(false)}
              />
            )}

            {managingHolidaysDate && (
              <HolidayDayManager
                key={`manager-${toYyyyMmDdLocal(managingHolidaysDate)}-${refreshKey}`}
                date={managingHolidaysDate}
                onUpdate={() => {
                  setRefreshKey(prev => prev + 1)
                  setTimeout(() => {
                    setManagingHolidaysDate(null)
                  }, 500)
                }}
                onClose={() => setManagingHolidaysDate(null)}
                canRemove={userRole === 'admin'}
                onEditAvailability={() => {
                  setEditingDate(managingHolidaysDate)
                  setManagingHolidaysDate(null)
                }}
              />
            )}

            {editingDate && (
              <CalendarDayEditor
                date={editingDate}
                onUpdate={handleEditorUpdate}
              />
            )}
          </div>
        </div>
      )}

      {/* Full-screen booking overlay */}
      {bookingMode && (
        <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-sm">
          <div className="flex flex-col h-full">
            {/* Overlay header */}
            <div className="px-4 sm:px-6 pt-3 pb-1 flex items-center justify-between border-b border-border/60">
              <div>
                <h2 className="text-sm font-semibold">Book time off</h2>
                <p className="text-[11px] text-muted-foreground">
                  Tap on the calendar to choose your start and end dates.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  setBookingMode(false)
                  setRequestError(null)
                }}
                aria-label="Close booking view"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Scrollable calendar area */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 pb-28">
              <HolidayCalendar
                key={`booking-${refreshKey}`}
                userRole={userRole}
                onDateClick={handleDateClick}
                onHolidayClick={(date) => {
                  // Managers/admins can still tap to see who is off that day
                  if (isManagerOrAdmin) {
                    setManagingHolidaysDate(date)
                  }
                }}
                selectedStartDate={selectedStartDate}
                selectedEndDate={selectedEndDate}
              />
            </div>

            {/* Bottom bar with start/end and request controls */}
            <div className="fixed bottom-0 left-0 right-0 z-[70]">
              <div className="relative bg-background/95 backdrop-blur-md border-t border-border/60 px-4 sm:px-6 pb-3 pt-2 space-y-2">
                {requestError && (
                  <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
                    {requestError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div className="border border-border/70 rounded-md bg-card/90 px-3 py-1.5">
                    <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      Start date
                    </div>
                    <div className="text-xs font-medium mt-0.5">
                      {formatDisplayDate(selectedStartDate)}
                    </div>
                  </div>

                  <div className="border border-border/70 rounded-md bg-card/90 px-3 py-1.5">
                    <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      End date
                    </div>
                    <div className="text-xs font-medium mt-0.5">
                      {formatDisplayDate(selectedEndDate)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[1.5fr_minmax(0,1fr)] gap-3 items-center">
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      Reason (optional)
                    </label>
                    <Input
                      value={requestReason}
                      onChange={(e) => setRequestReason(e.target.value)}
                      placeholder="e.g., Family holiday, Personal time"
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-1 sm:pt-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClearSelection}
                    >
                      Clear selection
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      disabled={!canSubmitRequest}
                      onClick={handleSubmitRequest}
                      className="min-w-[120px]"
                    >
                      {requestLoading ? 'Submitting...' : 'Submit request'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
