'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle, X } from 'lucide-react'
import type { User, UserRole } from '@/types/database'
import { formatStaffNameAndVenue } from '@/lib/staff-display'
import { Select, type SelectOption } from '@/components/ui/select'

interface VotingCardProps {
  userRole: UserRole
  currentVote?: {
    id: string
    nomineeId: string
    reason: string | null
    users?: User | null
  } | null
  currentUserId: string
}

export function VotingCard({ userRole, currentVote, currentUserId }: VotingCardProps) {
  const [staffMembers, setStaffMembers] = useState<User[]>([])
  const [selectedNomineeId, setSelectedNomineeId] = useState<string>(currentVote?.nomineeId || '')
  const [reason, setReason] = useState<string>(currentVote?.reason || '')
  const [loading, setLoading] = useState(false)
  const [showVoteForm, setShowVoteForm] = useState(false)
  const [fetchingStaff, setFetchingStaff] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchStaffMembers()
  }, [])

  const fetchStaffMembers = async () => {
    try {
      setFetchingStaff(true)
      const response = await fetch('/api/employee-votes/staff')
      if (!response.ok) {
        throw new Error('Failed to fetch staff members')
      }
      const data = await response.json()
      // Filter out current user if they're a staff member (prevent self-voting)
      const filtered = userRole === 'staff' 
        ? data.filter((staff: User) => staff.id !== currentUserId)
        : data
      setStaffMembers(filtered)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load staff members')
    } finally {
      setFetchingStaff(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedNomineeId) {
      setError('Please select a staff member')
      return
    }

    if (!reason.trim()) {
      setError('Please provide a reason for your vote')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/employee-votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nomineeId: selectedNomineeId,
          reason: reason.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit vote')
      }

      setSuccess(true)
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit vote')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setSelectedNomineeId('')
    setReason('')
    setError(null)
    setShowVoteForm(false)
  }

  const handleChangeVote = () => {
    setShowVoteForm(true)
    setSelectedNomineeId(currentVote?.nomineeId || '')
    setReason(currentVote?.reason || '')
  }

  // Show current vote if exists and not showing form
  if (currentVote && !showVoteForm) {
    const nominee = currentVote.users as User | null
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Vote</CardTitle>
          <CardDescription>
            You have already voted for this month. You can change your vote at any time.
            {userRole === 'admin' && (
              <span className="block mt-1 text-muted-foreground">
                Your vote counts toward the manager pick tally.
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Your Nominee</Label>
              <p className="text-foreground font-medium mt-1">
                {formatStaffNameAndVenue(nominee?.name, nominee?.site)}
              </p>
            </div>
            {currentVote.reason && (
              <div>
                <Label>Your Reason</Label>
                <p className="text-foreground mt-1">{currentVote.reason}</p>
              </div>
            )}
            <div className="pt-2">
              <Button
                onClick={handleChangeVote}
                variant="outline"
                className="w-full"
              >
                Change Vote
              </Button>
            </div>
            {error && (
              <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded p-2">
                {error}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (success) {
    return (
      <Card className="border-green-500/50 bg-green-500/10">
        <CardContent className="py-12">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <p className="text-lg font-medium text-foreground">Vote submitted successfully!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{currentVote ? 'Change Your Vote' : 'Vote for Employee of the Month'}</CardTitle>
        <CardDescription>
          {currentVote
            ? 'Select a different staff member or update your reason'
            : 'Select a staff member and provide a reason for your vote. You can change your vote at any time.'}
          {userRole === 'admin' && (
            <span className="block mt-1 text-muted-foreground">
              As an admin, your vote counts toward the manager pick tally (same as a manager vote).
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded p-2">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="nominee">Select Staff Member</Label>
            {fetchingStaff ? (
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading staff members...</span>
              </div>
            ) : (
              <div className="mt-1">
                <Select
                  id="nominee"
                  options={[
                    { value: '', label: '-- Select a staff member --' },
                    ...staffMembers.map((staff) => ({
                      value: staff.id,
                      label: `${staff.name}${staff.site ? ` - ${staff.site}` : ''}`,
                    })),
                  ]}
                  value={selectedNomineeId}
                  onChange={(value) => setSelectedNomineeId(value)}
                  placeholder="-- Select a staff member --"
                  required
                  disabled={loading}
                />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="reason">Reason</Label>
            <Input
              id="reason"
              type="text"
              placeholder="Why do you think they deserve Employee of the Month?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={loading || !selectedNomineeId || !reason.trim() || fetchingStaff}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {currentVote ? 'Updating...' : 'Submitting...'}
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {currentVote ? 'Update Vote' : 'Submit Vote'}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
