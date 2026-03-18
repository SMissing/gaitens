'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, Clock, User, X, Paperclip, MessageSquareText } from 'lucide-react'
import { formatDate } from '@/lib/date-utils'

interface Meeting {
  id: string
  title: string
  description: string | null
  severity?: string | null
  requestedBy: {
    id: string
    name: string
    staffCode: string
  } | null
  requestedFor: {
    id: string
    name: string
    staffCode: string
  } | null
  ccUsers?: Array<{
    id: string
    name: string
    staffCode: string
  }>
  status: string
  suggestedDate: string
  suggestedTime: string | null
  meetingDate: string | null
  meetingTime: string | null
  rescheduleReason: string | null

  followups?: Array<{
    id: string
    note: string
    createdAt: string
    createdBy: {
      id: string
      name: string
      staffCode: string
    } | null
  }>
}

interface MeetingModalProps {
  meeting: Meeting
  currentUserId: string
  onClose: () => void
  onUpdate: () => void
}

export function MeetingModal({ meeting, currentUserId, onClose, onUpdate }: MeetingModalProps) {
  const [action, setAction] = useState<'accept' | 'reschedule' | null>(null)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [attachmentsLoading, setAttachmentsLoading] = useState(false)
  const [attachmentsError, setAttachmentsError] = useState<string | null>(null)
  const [attachments, setAttachments] = useState<Array<{ id: string; fileName: string; url: string }>>([])

  const [followupsLoading, setFollowupsLoading] = useState(false)
  const [followupsError, setFollowupsError] = useState<string | null>(null)
  const [followups, setFollowups] = useState<
    Array<{
      id: string
      note: string
      createdAt: string
      createdBy: { id: string; name: string; staffCode: string } | null
    }>
  >(meeting.followups || [])
  const [followupNote, setFollowupNote] = useState('')

  const isRequester = meeting.requestedBy?.id === currentUserId
  const isRecipient = meeting.requestedFor?.id === currentUserId

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setAttachmentsLoading(true)
        setAttachmentsError(null)
        const res = await fetch(`/api/meetings/${meeting.id}/attachments`, { cache: 'no-store' })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load attachments')
        if (!cancelled) setAttachments(data.attachments || [])
      } catch (e) {
        if (!cancelled) {
          setAttachmentsError(e instanceof Error ? e.message : 'Failed to load attachments')
          setAttachments([])
        }
      } finally {
        if (!cancelled) setAttachmentsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [meeting.id])

  useEffect(() => {
    let cancelled = false
    async function loadFollowups() {
      try {
        setFollowupsLoading(true)
        setFollowupsError(null)
        const res = await fetch(`/api/meetings/${meeting.id}/followups`, { cache: 'no-store' })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load follow-ups')
        if (!cancelled) setFollowups(data.followups || [])
      } catch (e) {
        if (!cancelled) {
          setFollowupsError(e instanceof Error ? e.message : 'Failed to load follow-ups')
          setFollowups([])
        }
      } finally {
        if (!cancelled) setFollowupsLoading(false)
      }
    }
    loadFollowups()
    return () => {
      cancelled = true
    }
  }, [meeting.id])

  const formatTime = (time: string | null) => {
    if (!time) return null
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const severity = meeting.severity ? String(meeting.severity).toLowerCase() : null
  const severityLabel = severity ? severity[0].toUpperCase() + severity.slice(1) : null
  const severityBannerClass = (() => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 text-red-500 border-red-500/30'
      case 'high':
        return 'bg-orange-500/20 text-orange-500 border-orange-500/30'
      case 'low':
        return 'bg-green-500/20 text-green-500 border-green-500/30'
      case 'medium':
      default:
        return 'bg-spirits-magenta/20 text-spirits-magenta border-spirits-magenta/30'
    }
  })()

  const handleAccept = async () => {
    setLoading(true)
    setError(null)

    try {
      // Use suggested date/time (which may be the recipient's reschedule suggestion)
      const response = await fetch(`/api/meetings/${meeting.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'accept',
          meetingDate: meeting.suggestedDate,
          meetingTime: meeting.suggestedTime,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept meeting')
      }

      onUpdate()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept meeting')
    } finally {
      setLoading(false)
    }
  }

  const handleAddFollowup = async () => {
    if (!followupNote.trim()) return
    try {
      setFollowupsLoading(true)
      setFollowupsError(null)

      const res = await fetch(`/api/meetings/${meeting.id}/followups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: followupNote }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add follow-up')

      setFollowups((prev) => [data.followup, ...(prev || [])])
      setFollowupNote('')
      onUpdate()
    } catch (e) {
      setFollowupsError(e instanceof Error ? e.message : 'Failed to add follow-up')
    } finally {
      setFollowupsLoading(false)
    }
  }

  const handleReschedule = async () => {
    if (!newDate) {
      setError('Please select a new date')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const actionType = isRecipient ? 'reschedule' : 'propose_reschedule'
      
      const response = await fetch(`/api/meetings/${meeting.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: actionType,
          suggestedDate: newDate,
          suggestedTime: newTime || null,
          rescheduleReason: reason.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reschedule meeting')
      }

      onUpdate()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reschedule meeting')
    } finally {
      setLoading(false)
    }
  }

  const getStatusMessage = () => {
    if (meeting.status === 'pending') {
      return isRecipient 
        ? 'You have a meeting request'
        : 'Waiting for response'
    }
    if (meeting.status === 'reschedule_requested') {
      return isRequester
        ? 'Recipient requested to reschedule'
        : 'You requested to reschedule'
    }
    if (meeting.status === 'reschedule_proposed') {
      return isRecipient
        ? 'New time proposed'
        : 'You proposed a new time'
    }
    return ''
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center px-4 touch-manipulation"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 80px)',
        paddingBottom: 'calc(max(16px, env(safe-area-inset-bottom, 16px) + 16px) + 96px)',
      }}
      onClick={onClose}
    >
      <Card
        className="bg-[#1e1e1e] rounded-2xl border border-border/50 max-w-2xl w-full h-full overflow-hidden flex flex-col -webkit-overflow-scrolling-touch"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 min-h-[44px] min-w-[44px] touch-manipulation"
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Content */}
        <CardContent className="p-4 sm:p-6 overflow-y-auto flex-1 -webkit-overflow-scrolling-touch">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                {meeting.title}
              </h2>
              {getStatusMessage() && (
                <p className="text-sm text-spirits-magenta font-semibold">
                  {getStatusMessage()}
                </p>
              )}

              {severityLabel && (
                <div className={`text-xs font-semibold border rounded-xl px-3 py-2 ${severityBannerClass}`}>
                  Severity: {severityLabel}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>
                  {isRequester 
                    ? `With: ${meeting.requestedFor?.name}`
                    : `From: ${meeting.requestedBy?.name}`
                  }
                </span>
              </div>

              {meeting.ccUsers && meeting.ccUsers.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  CC: {meeting.ccUsers.map((u) => u.name).join(', ')}
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Suggested: {formatDate(meeting.suggestedDate)}</span>
              </div>

              {meeting.suggestedTime && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Time: {formatTime(meeting.suggestedTime)}</span>
                </div>
              )}

              {meeting.rescheduleReason && (
                <div className="p-3 bg-muted/50 rounded-xl">
                  <p className="text-xs font-semibold text-foreground mb-1">Reschedule Reason:</p>
                  <p className="text-sm text-muted-foreground">{meeting.rescheduleReason}</p>
                </div>
              )}
            </div>

            {meeting.description && (
              <div className="pt-4 border-t border-border/50">
                <h3 className="text-sm font-semibold text-foreground mb-2">Description</h3>
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {meeting.description}
                </p>
              </div>
            )}

            {/* Attachments */}
            <div className="pt-4 border-t border-border/50 space-y-3">
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-spirits-magenta" />
                <h3 className="text-sm font-semibold text-foreground">Attachments</h3>
              </div>

              {attachmentsError && <div className="text-xs text-red-500">{attachmentsError}</div>}

              {attachmentsLoading ? (
                <div className="text-xs text-muted-foreground">Loading attachments...</div>
              ) : attachments.length === 0 ? (
                <div className="text-xs text-muted-foreground">No attachments yet.</div>
              ) : (
                <div className="space-y-2">
                  {attachments.map((att) => (
                    <a
                      key={att.id}
                      href={att.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-3 text-sm px-3 py-2 rounded-lg border border-border/50 bg-card/50 hover:border-spirits-magenta/40"
                    >
                      <span className="truncate">{att.fileName}</span>
                      <span className="text-xs text-muted-foreground">Open</span>
                    </a>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="meeting-attachments">Upload files</Label>
                <Input
                  id="meeting-attachments"
                  type="file"
                  multiple
                  onChange={async (e) => {
                    const files = e.target.files ? Array.from(e.target.files) : []
                    if (files.length === 0) return

                    try {
                      setAttachmentsError(null)
                      setAttachmentsLoading(true)
                      const formData = new FormData()
                      for (const f of files) formData.append('files', f)

                      const res = await fetch(`/api/meetings/${meeting.id}/attachments`, {
                        method: 'POST',
                        body: formData,
                      })
                      const data = await res.json()
                      if (!res.ok) throw new Error(data.error || 'Upload failed')

                      setAttachments(data.attachments || [])
                      onUpdate()
                    } catch (err) {
                      setAttachmentsError(err instanceof Error ? err.message : 'Upload failed')
                    } finally {
                      setAttachmentsLoading(false)
                      // Clear input so selecting the same file again triggers onChange.
                      if (e.target) (e.target as HTMLInputElement).value = ''
                    }
                  }}
                />
              </div>
            </div>

            {/* Follow-ups */}
            <div className="pt-4 border-t border-border/50 space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquareText className="h-4 w-4 text-spirits-magenta" />
                <h3 className="text-sm font-semibold text-foreground">Follow-ups</h3>
              </div>

              {followupsError && <div className="text-xs text-red-500">{followupsError}</div>}

              {followupsLoading ? (
                <div className="text-xs text-muted-foreground">Loading follow-ups...</div>
              ) : followups.length === 0 ? (
                <div className="text-xs text-muted-foreground">No follow-ups yet.</div>
              ) : (
                <div className="space-y-2">
                  {followups
                    .slice()
                    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
                    .map((fu) => (
                      <div key={fu.id} className="border border-border/50 rounded-lg bg-card/50 p-3 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="text-sm font-semibold text-foreground">
                            {fu.createdBy?.name || 'Unknown'}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {fu.createdAt
                              ? new Date(fu.createdAt).toLocaleString('en-GB', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : null}
                          </div>
                        </div>
                        <div className="text-sm text-foreground whitespace-pre-wrap">{fu.note}</div>
                      </div>
                    ))}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="followupNote">Add follow-up note</Label>
                <Textarea
                  id="followupNote"
                  value={followupNote}
                  onChange={(e) => setFollowupNote(e.target.value)}
                  placeholder="Write a quick follow-up note..."
                />
                <Button onClick={handleAddFollowup} disabled={followupsLoading || !followupNote.trim()}>
                  Add follow-up
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            {!action && (
              <div className="pt-4 border-t border-border/50 space-y-2">
                {meeting.status === 'pending' && isRecipient && (
                  <>
                    <Button
                      onClick={handleAccept}
                      disabled={loading}
                      className="w-full bg-spirits-cyan hover:bg-spirits-cyan-dark"
                    >
                      Accept Meeting
                    </Button>
                    <Button
                      onClick={() => setAction('reschedule')}
                      variant="outline"
                      className="w-full"
                    >
                      Request to Reschedule
                    </Button>
                  </>
                )}

                {meeting.status === 'reschedule_requested' && isRequester && (
                  <>
                    <Button
                      onClick={handleAccept}
                      disabled={loading}
                      className="w-full bg-spirits-cyan hover:bg-spirits-cyan-dark"
                    >
                      Accept Reschedule
                    </Button>
                    <Button
                      onClick={() => setAction('reschedule')}
                      variant="outline"
                      className="w-full"
                    >
                      Propose Different Time
                    </Button>
                  </>
                )}

                {meeting.status === 'reschedule_proposed' && isRecipient && (
                  <>
                    <Button
                      onClick={handleAccept}
                      disabled={loading}
                      className="w-full bg-spirits-cyan hover:bg-spirits-cyan-dark"
                    >
                      Accept New Time
                    </Button>
                    <Button
                      onClick={() => setAction('reschedule')}
                      variant="outline"
                      className="w-full"
                    >
                      Request Different Time
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* Reschedule Form */}
            {action === 'reschedule' && (
              <div className="pt-4 border-t border-border/50 space-y-4">
                <div>
                  <Label htmlFor="newDate">New Suggested Date *</Label>
                  <Input
                    id="newDate"
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="newTime">New Suggested Time (Optional)</Label>
                  <Input
                    id="newTime"
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="reason">Reason for Reschedule (Optional)</Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Why do you need to reschedule?"
                    rows={3}
                    maxLength={1000}
                    className="mt-1 resize-none"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleReschedule}
                    disabled={loading || !newDate}
                    className="flex-1"
                  >
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </Button>
                  <Button
                    onClick={() => {
                      setAction(null)
                      setNewDate('')
                      setNewTime('')
                      setReason('')
                      setError(null)
                    }}
                    variant="outline"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
