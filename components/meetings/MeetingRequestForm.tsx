'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { CheckCircle, X } from 'lucide-react'

interface User {
  id: string
  name: string
  staffCode: string
  role: string
}

interface MeetingRequestFormProps {
  onSuccess: () => void
}

export function MeetingRequestForm({ onSuccess }: MeetingRequestFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [requestedFor, setRequestedFor] = useState('')
  const [suggestedDate, setSuggestedDate] = useState('')
  const [suggestedTime, setSuggestedTime] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    // Fetch users (staff and managers)
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/staff?active=true')
        if (response.ok) {
          const data = await response.json()
          // Filter to only staff and managers
          const filteredUsers = (data || []).filter((u: User) => 
            u.role === 'staff' || u.role === 'manager'
          )
          setUsers(filteredUsers)
        }
      } catch (err) {
        console.error('Error fetching users:', err)
      } finally {
        setLoadingUsers(false)
      }
    }

    fetchUsers()
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
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create meeting request')
      }

      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        setTitle('')
        setDescription('')
        setRequestedFor('')
        setSuggestedDate('')
        setSuggestedTime('')
        onSuccess()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create meeting request')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <Card className="bg-[#1e1e1e] rounded-2xl border border-border/50">
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Meeting Request Sent Successfully
          </h3>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[#1e1e1e] rounded-2xl border border-border/50">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-foreground">
          Request Meeting
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Schedule a meeting with a staff member or manager
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Meeting Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Performance Review, Training Discussion"
              maxLength={200}
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="requestedFor">Select Staff Member or Manager *</Label>
            {loadingUsers ? (
              <div className="mt-1 text-sm text-muted-foreground">Loading users...</div>
            ) : (
              <Select
                id="requestedFor"
                value={requestedFor}
                onChange={(value) => setRequestedFor(value)}
                options={users.map(u => ({
                  value: u.id,
                  label: `${u.name} (${u.staffCode})${u.role === 'manager' ? ' - Manager' : ''}`
                }))}
                placeholder="Select a staff member..."
                className="mt-1"
                required
              />
            )}
          </div>

          <div>
            <Label htmlFor="suggestedDate">Suggested Date *</Label>
            <Input
              id="suggestedDate"
              type="date"
              value={suggestedDate}
              onChange={(e) => setSuggestedDate(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="suggestedTime">Suggested Time (Optional)</Label>
            <Input
              id="suggestedTime"
              type="time"
              value={suggestedTime}
              onChange={(e) => setSuggestedTime(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this meeting about?"
              rows={4}
              maxLength={2000}
              className="mt-1 resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {description.length}/2000 characters
            </p>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || loadingUsers}
            className="w-full"
          >
            {loading ? 'Sending Request...' : 'Send Meeting Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
