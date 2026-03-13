'use client'

import { useState } from 'react'
import { HolidayCalendar } from './HolidayCalendar'
import { HolidayRequestForm } from './HolidayRequestForm'
import { CalendarDayEditor } from './CalendarDayEditor'
import { HolidayDayManager } from './HolidayDayManager'
import { AddHolidayForm } from './AddHolidayForm'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import type { UserRole } from '@/types/database'

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

  const isAdmin = userRole === 'admin'

  const handleDateClick = (date: Date) => {
    if (isAdmin) {
      // Check if this date has approved holidays - if so, show holiday manager
      // Otherwise, show calendar day editor
      // We'll determine this in the calendar component and pass a flag
      // For now, we'll show the calendar day editor
      setEditingDate(date)
      setManagingHolidaysDate(null)
      setSelectedStartDate(null)
      setSelectedEndDate(null)
    } else {
      // Staff click to select date range
      // If clicking the start date again, clear selection
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
      <div className="flex justify-end items-center mb-6">
        {isAdmin && (
          <Button
            onClick={() => setShowAddHoliday(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Holiday
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
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

        {/* Sidebar */}
        <div className="space-y-6">
          {isAdmin && showAddHoliday ? (
            <AddHolidayForm
              onSuccess={() => {
                setShowAddHoliday(false)
                // Small delay to ensure database update completes
                setTimeout(() => {
                  setRefreshKey(prev => prev + 1)
                }, 300)
              }}
              onClose={() => setShowAddHoliday(false)}
            />
          ) : isAdmin && managingHolidaysDate ? (
            <HolidayDayManager
              key={`manager-${managingHolidaysDate.toISOString()}-${refreshKey}`}
              date={managingHolidaysDate}
              onUpdate={() => {
                console.log('HolidayDayManager onUpdate called, refreshing calendar')
                // Refresh the calendar immediately by incrementing refreshKey
                // This will cause HolidayCalendar to remount and refetch all data
                setRefreshKey(prev => {
                  const newKey = prev + 1
                  console.log('RefreshKey updated to:', newKey)
                  return newKey
                })
                // Keep the manager open briefly to show the update, then close
                setTimeout(() => {
                  setManagingHolidaysDate(null)
                }, 500)
              }}
              onClose={() => setManagingHolidaysDate(null)}
              onEditAvailability={() => {
                setEditingDate(managingHolidaysDate)
                setManagingHolidaysDate(null)
              }}
            />
          ) : isAdmin && editingDate ? (
            <CalendarDayEditor
              date={editingDate}
              onUpdate={handleEditorUpdate}
            />
          ) : (
            <HolidayRequestForm
              selectedStartDate={selectedStartDate}
              selectedEndDate={selectedEndDate}
              onSuccess={handleRequestSuccess}
              onClear={handleClearSelection}
            />
          )}
        </div>
      </div>
    </div>
  )
}
