'use client'

import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { staffListFromApiResponse } from '@/lib/staff-permissions'
import { MEETINGS_DOCK_SUBMIT_FORM } from '@/lib/meetings-dock-bridge'
import { formatStaffNameAndVenue } from '@/lib/staff-display'
import type { User } from '@/types/database'

interface MeetingRequestFormProps {
  onSuccess: () => void
  onFormActivityChange: (state: { saving: boolean; blocking: boolean }) => void
}

function FormSection({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: ReactNode
}) {
  return (
    <section className="border-t border-white/[0.08] pt-8 first:border-t-0 first:pt-0 scroll-mt-20">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-spirits-yellow/90">
        {title}
      </h2>
      {hint ? (
        <p className="text-sm text-muted-foreground mt-1.5 mb-5 leading-relaxed max-w-prose">
          {hint}
        </p>
      ) : (
        <div className="mb-5" />
      )}
      <div className="space-y-4">{children}</div>
    </section>
  )
}

export function MeetingRequestForm({
  onSuccess,
  onFormActivityChange,
}: MeetingRequestFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [requestedFor, setRequestedFor] = useState('')
  const [suggestedDate, setSuggestedDate] = useState('')
  const [suggestedTime, setSuggestedTime] = useState('')
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>(
    'medium'
  )
  const [ccUserIds, setCcUserIds] = useState<string[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useLayoutEffect(() => {
    onFormActivityChange({
      saving: loading,
      blocking: loadingUsers,
    })
  }, [loading, loadingUsers, onFormActivityChange])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/staff?active=true')
        if (response.ok) {
          const data = await response.json()
          const list = staffListFromApiResponse(data)
          const filteredUsers = list.filter(
            (u: User) => u.role === 'staff' || u.role === 'manager'
          )
          setUsers(filteredUsers)
        }
      } catch (err) {
        console.error('Error fetching users:', err)
      } finally {
        setLoadingUsers(false)
      }
    }

    void fetchUsers()
  }, [])

  useEffect(() => {
    const onSubmitDock = () => {
      formRef.current?.requestSubmit()
    }
    window.addEventListener(MEETINGS_DOCK_SUBMIT_FORM, onSubmitDock)
    return () =>
      window.removeEventListener(MEETINGS_DOCK_SUBMIT_FORM, onSubmitDock)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Please enter a meeting title')
      return
    }

    if (!requestedFor) {
      setError('Please select a staff member')
      return
    }

    if (!suggestedDate) {
      setError('Please select a suggested date')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          requestedFor,
          suggestedDate,
          suggestedTime: suggestedTime.trim() || null,
          severity,
          ccUserIds: ccUserIds.length > 0 ? ccUserIds : null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create meeting request')
      }

      onSuccess()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create meeting request'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full pb-8">
      {error && (
        <div className="mb-6 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="max-w-2xl">
        <header className="mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Request a meeting
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-2 leading-relaxed max-w-prose">
            Choose who it’s with and when you’d like it. Cancel or send from the
            dock below.
          </p>
        </header>

        <div className="space-y-10">
          <FormSection
            title="Basics"
            hint="Title and who the meeting is for. They’ll get the request to confirm or suggest another time."
          >
            <div className="space-y-2">
              <Label htmlFor="title">Meeting title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Performance check-in, training follow-up"
                maxLength={200}
                required
                className="bg-background/80 border-border/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requestedFor">With</Label>
              {loadingUsers ? (
                <p className="text-sm text-muted-foreground py-2">
                  Loading staff…
                </p>
              ) : (
                <Select
                  id="requestedFor"
                  value={requestedFor}
                  onChange={(value) => setRequestedFor(value)}
                  options={users.map((u) => ({
                    value: u.id,
                    label: `${formatStaffNameAndVenue(u.name, u.site)}${u.role === 'manager' ? ' — Manager' : ''}`,
                  }))}
                  placeholder="Select a person…"
                  required
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Notes (optional)</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What should this meeting cover?"
                rows={4}
                maxLength={2000}
                className="w-full min-h-[120px] rounded-xl border border-border/50 bg-background/80 px-3 py-3 text-sm leading-relaxed resize-y"
              />
              <p className="text-xs text-muted-foreground tabular-nums">
                {description.length}/2000
              </p>
            </div>
          </FormSection>

          <FormSection
            title="Timing"
            hint="Suggested date is required; time is optional if you’re flexible."
          >
            <div className="space-y-2 max-w-xs">
              <Label htmlFor="suggestedDate">Suggested date</Label>
              <Input
                id="suggestedDate"
                type="date"
                value={suggestedDate}
                onChange={(e) => setSuggestedDate(e.target.value)}
                required
                className="bg-background/80 border-border/50"
              />
            </div>
            <div className="space-y-2 max-w-xs">
              <Label htmlFor="suggestedTime">Suggested time (optional)</Label>
              <Input
                id="suggestedTime"
                type="time"
                value={suggestedTime}
                onChange={(e) => setSuggestedTime(e.target.value)}
                className="bg-background/80 border-border/50"
              />
            </div>
          </FormSection>

          <FormSection
            title="Priority & CC"
            hint="Severity helps others see urgency. CC adds people who should stay informed."
          >
            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <Select
                id="severity"
                value={severity}
                onChange={(v) => setSeverity(v as typeof severity)}
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'critical', label: 'Critical' },
                ]}
              />
            </div>

            <div className="space-y-2">
              <Label>CC (optional)</Label>
              {loadingUsers ? (
                <p className="text-sm text-muted-foreground py-2">Loading…</p>
              ) : (
                <div className="max-h-44 space-y-2 overflow-y-auto rounded-xl border border-border/50 bg-white/[0.03] p-3">
                  {users
                    .filter((u) => u.id !== requestedFor)
                    .map((u) => (
                      <label
                        key={u.id}
                        className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground"
                      >
                        <input
                          type="checkbox"
                          checked={ccUserIds.includes(u.id)}
                          onChange={() => {
                            setCcUserIds((prev) => {
                              if (prev.includes(u.id))
                                return prev.filter((id) => id !== u.id)
                              return [...prev, u.id]
                            })
                          }}
                          className="h-4 w-4 shrink-0 rounded border-input accent-spirits-yellow"
                        />
                        <span>
                          {formatStaffNameAndVenue(u.name, u.site)}
                          {u.role === 'manager' ? ' — Manager' : ''}
                        </span>
                      </label>
                    ))}
                  {users.filter((u) => u.id !== requestedFor).length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No one else to CC.
                    </p>
                  )}
                </div>
              )}
            </div>
          </FormSection>
        </div>
      </form>
    </div>
  )
}
