'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatDate } from '@/lib/date-utils'
import type { HolidayRequest } from '@/types/database'
import type { User } from '@/types/database'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface HolidayRequestWithUser extends HolidayRequest {
  users: User | null
}

interface ApproveHolidaysClientProps {
  initialRequests: HolidayRequestWithUser[]
}

export function ApproveHolidaysClient({ initialRequests }: ApproveHolidaysClientProps) {
  const [requests, setRequests] = useState<HolidayRequestWithUser[]>(initialRequests)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const handleApprove = async (requestId: string) => {
    setProcessingId(requestId)
    setError(null)

    try {
      const response = await fetch(`/api/holidays/requests/${requestId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'approved' }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to approve request')
      }

      // Remove the approved request from the list
      setRequests(prev => prev.filter(req => req.id !== requestId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve request')
    } finally {
      setProcessingId(null)
    }
  }

  const handleRejectClick = (requestId: string) => {
    setRejectingId(requestId)
    setRejectionReason('')
  }

  const handleRejectCancel = () => {
    setRejectingId(null)
    setRejectionReason('')
  }

  const handleReject = async (requestId: string) => {
    setProcessingId(requestId)
    setError(null)

    try {
      const response = await fetch(`/api/holidays/requests/${requestId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: 'rejected',
          rejectionReason: rejectionReason.trim() || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to reject request')
      }

      // Remove the rejected request from the list
      setRequests(prev => prev.filter(req => req.id !== requestId))
      setRejectingId(null)
      setRejectionReason('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject request')
    } finally {
      setProcessingId(null)
    }
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No pending holiday requests</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <Card className="border-red-500/50 bg-red-500/10">
          <CardContent className="py-4">
            <p className="text-sm text-red-500">{error}</p>
          </CardContent>
        </Card>
      )}

      {requests.map((request) => {
        const user = request.users as User | null
        const isProcessing = processingId === request.id

        return (
          <Card key={request.id} className={isProcessing ? 'opacity-50' : ''}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{user?.name || 'Unknown User'}</CardTitle>
                  <CardDescription>
                    {user?.site || 'No site assigned'}
                  </CardDescription>
                </div>
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 text-xs font-medium rounded border border-yellow-500/30">
                  Pending
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Date Range</p>
                  <p className="text-foreground">
                    {formatDate(request.startDate)} - {formatDate(request.endDate)}
                  </p>
                </div>

                {request.reason && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Reason</p>
                    <p className="text-foreground">{request.reason}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Requested</p>
                  <p className="text-foreground">{formatDate(request.createdAt)}</p>
                </div>

                {rejectingId === request.id ? (
                  <div className="space-y-4 pt-2 border-t border-border">
                    <div>
                      <Label htmlFor={`rejection-reason-${request.id}`}>
                        Rejection Reason (Optional)
                      </Label>
                      <Input
                        id={`rejection-reason-${request.id}`}
                        type="text"
                        placeholder="Enter reason for rejection..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="mt-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleReject(request.id)
                          }
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleReject(request.id)}
                        disabled={isProcessing}
                        variant="destructive"
                        className="flex-1"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Confirm Rejection
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleRejectCancel}
                        disabled={isProcessing}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleApprove(request.id)}
                      disabled={isProcessing || rejectingId !== null}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleRejectClick(request.id)}
                      disabled={isProcessing || rejectingId !== null}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
