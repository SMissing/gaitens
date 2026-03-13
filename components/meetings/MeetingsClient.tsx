'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MeetingRequestForm } from './MeetingRequestForm'
import { MeetingsList } from './MeetingsList'

interface MeetingsClientProps {
  currentUserId: string
}

export function MeetingsClient({ currentUserId }: MeetingsClientProps) {
  const [showForm, setShowForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSuccess = () => {
    setShowForm(false)
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="space-y-6">
      {showForm ? (
        <MeetingRequestForm onSuccess={handleSuccess} />
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => setShowForm(true)}
              className="bg-spirits-magenta hover:bg-spirits-magenta/80"
            >
              Request New Meeting
            </Button>
          </div>
          <MeetingsList key={refreshKey} currentUserId={currentUserId} />
        </>
      )}
    </div>
  )
}
