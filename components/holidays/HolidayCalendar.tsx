'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { HolidayCalendarAvailability, HolidayRequest } from '@/types/database'
import type { User } from '@/types/database'

interface ApprovedHolidayRequest extends HolidayRequest {
  users: User | User[] | null
}

interface HolidayCalendarProps {
  userRole: 'staff' | 'manager' | 'admin'
  onDateClick?: (date: Date) => void
  onHolidayClick?: (date: Date) => void
  selectedStartDate?: Date | null
  selectedEndDate?: Date | null
}

export function HolidayCalendar({ 
  userRole, 
  onDateClick,
  onHolidayClick,
  selectedStartDate,
  selectedEndDate 
}: HolidayCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [availability, setAvailability] = useState<Record<string, 'green' | 'yellow' | 'red'>>({})
  const [holidayRequests, setHolidayRequests] = useState<HolidayRequest[]>([])
  const [approvedHolidays, setApprovedHolidays] = useState<Record<string, ApprovedHolidayRequest[]>>({})
  const [loading, setLoading] = useState(true)
  
  const isManagerOrAdmin = userRole === 'manager' || userRole === 'admin'
  const isAdmin = userRole === 'admin'

  useEffect(() => {
    console.log('HolidayCalendar useEffect triggered, fetching calendar data')
    // Clear approved holidays first to ensure fresh data
    setApprovedHolidays({})
    setAvailability({})
    fetchCalendarData()
  }, [currentMonth, isManagerOrAdmin])

  // Also refetch when component remounts (when refreshKey changes)
  // The key prop on HolidayCalendar will cause remount, triggering this useEffect

  const fetchCalendarData = async () => {
    try {
      setLoading(true)
      const year = currentMonth.getFullYear()
      const month = currentMonth.getMonth()
      const startDate = new Date(year, month, 1).toISOString().split('T')[0]
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0]

      const fetchPromises = [
        fetch(`/api/holidays/calendar?startDate=${startDate}&endDate=${endDate}`, {
          cache: 'no-store',
        }),
        fetch('/api/holidays/requests', {
          cache: 'no-store',
        })
      ]

      // Only fetch approved holidays for managers/admins
      if (isManagerOrAdmin) {
        fetchPromises.push(
          fetch(`/api/holidays/approved?startDate=${startDate}&endDate=${endDate}`, {
            cache: 'no-store',
          })
        )
      }

      const responses = await Promise.all(fetchPromises)
      const [availabilityRes, requestsRes, approvedRes] = responses

      if (availabilityRes.ok) {
        const data = await availabilityRes.json()
        const availabilityMap: Record<string, 'green' | 'yellow' | 'red'> = {}
        data.forEach((day: HolidayCalendarAvailability) => {
          availabilityMap[day.date] = day.status
        })
        setAvailability(availabilityMap)
      }

      if (requestsRes.ok) {
        const data = await requestsRes.json()
        setHolidayRequests(data)
      }

      // Process approved holidays for managers/admins
      if (isManagerOrAdmin && approvedRes && approvedRes.ok) {
        const approvedData: ApprovedHolidayRequest[] = await approvedRes.json()
        console.log('Fetched approved holidays:', approvedData.length)
        console.log('Sample holiday data:', approvedData[0])
        const holidaysByDate: Record<string, ApprovedHolidayRequest[]> = {}
        
        approvedData.forEach((request) => {
          // Log if user data is missing
          if (!request.users) {
            console.warn('Holiday request missing user data:', request.id, request.userId)
          }
          
          const start = new Date(request.startDate)
          const end = new Date(request.endDate)
          const currentDate = new Date(start)
          
          while (currentDate <= end) {
            const dateStr = currentDate.toISOString().split('T')[0]
            if (!holidaysByDate[dateStr]) {
              holidaysByDate[dateStr] = []
            }
            // Check if this holiday request is already in the array for this date
            const alreadyExists = holidaysByDate[dateStr].some(h => h.id === request.id)
            if (!alreadyExists) {
              holidaysByDate[dateStr].push(request)
            }
            currentDate.setDate(currentDate.getDate() + 1)
          }
        })
        
        console.log('Processed holidays by date:', Object.keys(holidaysByDate).length, 'days')
        setApprovedHolidays(holidaysByDate)
      } else if (isManagerOrAdmin && approvedRes && !approvedRes.ok) {
        console.error('Failed to fetch approved holidays:', approvedRes.status)
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (Date | null)[] = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }

  const getDayStatus = (date: Date): 'green' | 'yellow' | 'red' => {
    const dateStr = date.toISOString().split('T')[0]
    return availability[dateStr] || 'green'
  }

  const isDateSelected = (date: Date): boolean => {
    if (!selectedStartDate) return false
    if (!selectedEndDate) {
      return date.toDateString() === selectedStartDate.toDateString()
    }
    return date >= selectedStartDate && date <= selectedEndDate
  }

  const isDateInRange = (date: Date): boolean => {
    if (!selectedStartDate || !selectedEndDate) return false
    return date >= selectedStartDate && date <= selectedEndDate
  }

  const getDayColor = (date: Date): string => {
    const status = getDayStatus(date)
    const isSelected = isDateSelected(date)
    const isInRange = isDateInRange(date) && !isSelected
    
    if (isSelected) {
      return 'bg-spirits-cyan/60 border-2 border-spirits-cyan'
    }
    if (isInRange) {
      return 'bg-spirits-cyan/30'
    }

    switch (status) {
      case 'green':
        return 'bg-green-500/30 hover:bg-green-500/40'
      case 'yellow':
        return 'bg-yellow-500/40 hover:bg-yellow-500/50'
      case 'red':
        return isAdmin 
          ? 'bg-red-500/40 hover:bg-red-500/50' 
          : 'bg-red-500/40 hover:bg-red-500/50 cursor-not-allowed opacity-60'
      default:
        return 'bg-green-500/30 hover:bg-green-500/40'
    }
  }

  const handleDateClick = (date: Date) => {
    // Admins can click red days, but regular users cannot
    const status = getDayStatus(date)
    if (!isAdmin && status === 'red') return
    onDateClick?.(date)
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const days = getDaysInMonth(currentMonth)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="bg-card/80 backdrop-blur-md rounded-lg border border-border/50 p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={previousMonth}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h2 className="text-2xl font-bold text-foreground">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={nextMonth}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day Names Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="aspect-square" />
            }

            const isToday = date.toDateString() === today.toDateString()
            const isPast = date < today
            const status = getDayStatus(date)
            const dateStr = date.toISOString().split('T')[0]
            const dayHolidays = approvedHolidays[dateStr] || []

            const handleClick = () => {
              // If admin clicks on a day with holidays, show holiday manager
              // Otherwise, show calendar day editor or handle normal date selection
              if (isAdmin && dayHolidays.length > 0) {
                onHolidayClick?.(date)
              } else {
                handleDateClick(date)
              }
            }

            // Admins can always click (including red days), regular users cannot click red days or past days
            const isClickable = !isPast && (isAdmin || status !== 'red')

            return (
              <button
                key={date.toISOString()}
                onClick={handleClick}
                disabled={!isClickable}
                className={`
                  aspect-square rounded-lg border transition-all
                  ${getDayColor(date)}
                  ${isToday ? 'ring-2 ring-spirits-cyan ring-offset-2 ring-offset-background' : ''}
                  ${isPast ? 'opacity-40 cursor-not-allowed' : ''}
                  ${isAdmin && dayHolidays.length > 0 ? 'hover:ring-2 hover:ring-garrison-orange/50' : ''}
                  ${isAdmin && status === 'red' ? 'hover:ring-2 hover:ring-red-500/50' : ''}
                  flex flex-col items-center justify-between text-sm font-medium
                  text-foreground relative overflow-hidden p-1
                `}
              >
                <span className="text-xs font-semibold">{date.getDate()}</span>
                {isManagerOrAdmin && dayHolidays.length > 0 && (
                  <div className="w-full">
                    <div className="text-[9px] leading-tight text-foreground/90 font-normal space-y-0.5">
                      {dayHolidays.slice(0, 2).map((req, idx) => {
                        // Handle both array and object formats from Supabase
                        const userData = Array.isArray(req.users) ? req.users[0] : req.users
                        const user = userData as User | null
                        return (
                          <div key={idx} className="truncate px-0.5" title={user?.name || 'Unknown'}>
                            {user?.name || 'Unknown'}
                          </div>
                        )
                      })}
                      {dayHolidays.length > 2 && (
                        <div className="text-[8px] opacity-75 px-0.5">+{dayHolidays.length - 2} more</div>
                      )}
                    </div>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500/30 border border-green-500/50" />
          <span className="text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500/40 border border-yellow-500/50" />
          <span className="text-muted-foreground">Limited Availability</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500/40 border border-red-500/50" />
          <span className="text-muted-foreground">Unavailable</span>
        </div>
      </div>
    </div>
  )
}
