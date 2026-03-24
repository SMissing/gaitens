'use client'

import { useState, useEffect, useCallback } from 'react'
import { MeetingRequestForm } from './MeetingRequestForm'
import { MeetingsList } from './MeetingsList'
import {
  MEETINGS_DOCK_ADD,
  MEETINGS_DOCK_CLOSE_FORM,
  MEETINGS_DOCK_REFRESH,
  MEETINGS_DOCK_STATE,
} from '@/lib/meetings-dock-bridge'

interface MeetingsClientProps {
  currentUserId: string
}

export function MeetingsClient({ currentUserId }: MeetingsClientProps) {
  const [showForm, setShowForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [listLoading, setListLoading] = useState(true)
  const [formActivity, setFormActivity] = useState({
    saving: false,
    blocking: false,
  })

  const handleSuccess = useCallback(() => {
    setShowForm(false)
    setRefreshKey((prev) => prev + 1)
  }, [])

  useEffect(() => {
    if (!showForm) {
      setFormActivity({ saving: false, blocking: false })
    }
  }, [showForm])

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent(MEETINGS_DOCK_STATE, {
        detail: {
          formOpen: showForm,
          listLoading,
          saving: formActivity.saving,
          formBlocking: showForm ? formActivity.blocking : false,
        },
      })
    )
  }, [showForm, listLoading, formActivity])

  useEffect(() => {
    const onAdd = () => setShowForm(true)
    const onClose = () => setShowForm(false)
    const onRefresh = () => setRefreshKey((k) => k + 1)

    window.addEventListener(MEETINGS_DOCK_ADD, onAdd)
    window.addEventListener(MEETINGS_DOCK_CLOSE_FORM, onClose)
    window.addEventListener(MEETINGS_DOCK_REFRESH, onRefresh)

    return () => {
      window.removeEventListener(MEETINGS_DOCK_ADD, onAdd)
      window.removeEventListener(MEETINGS_DOCK_CLOSE_FORM, onClose)
      window.removeEventListener(MEETINGS_DOCK_REFRESH, onRefresh)
    }
  }, [])

  return (
    <div className="space-y-4">
      {showForm ? (
        <MeetingRequestForm
          onSuccess={handleSuccess}
          onFormActivityChange={setFormActivity}
        />
      ) : (
        <MeetingsList
          key={refreshKey}
          currentUserId={currentUserId}
          onLoadingChange={setListLoading}
        />
      )}
    </div>
  )
}
