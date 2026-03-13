'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { FileText, Calendar, User, CheckCircle, Clock, XCircle } from 'lucide-react'
import type { Grievance } from '@/types/database'

interface GrievanceWithUser extends Grievance {
  user: {
    id: string
    name: string
    site: string | null
  }
}

interface GrievancesListProps {
  initialGrievances: GrievanceWithUser[]
}

const statusColors = {
  submitted: 'bg-blue-500/20 text-blue-500 border-blue-500/50',
  in_review: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
  resolved: 'bg-green-500/20 text-green-500 border-green-500/50',
}

const statusIcons = {
  submitted: Clock,
  in_review: Clock,
  resolved: CheckCircle,
}

export function GrievancesList({ initialGrievances }: GrievancesListProps) {
  const [grievances, setGrievances] = useState<GrievanceWithUser[]>(initialGrievances)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [updatingGrievances, setUpdatingGrievances] = useState<Set<string>>(new Set())

  const handleStatusUpdate = async (grievanceId: string, newStatus: 'submitted' | 'in_review' | 'resolved') => {
    setUpdatingGrievances(prev => new Set(prev).add(grievanceId))

    try {
      const response = await fetch(`/api/grievances/${grievanceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      // Update local state
      setGrievances(prev =>
        prev.map(g =>
          g.id === grievanceId
            ? { ...g, status: newStatus, updatedAt: new Date().toISOString() }
            : g
        )
      )
    } catch (error) {
      console.error('Failed to update grievance status:', error)
      alert('Failed to update grievance status')
    } finally {
      setUpdatingGrievances(prev => {
        const next = new Set(prev)
        next.delete(grievanceId)
        return next
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const filteredGrievances = statusFilter === 'all'
    ? grievances
    : grievances.filter(g => g.status === statusFilter)

  if (grievances.length === 0) {
    return (
      <Card className="bg-[#1e1e1e] rounded-2xl border border-border/50">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No grievances submitted yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex justify-end">
        <Select
          value={statusFilter}
          onChange={(value) => setStatusFilter(value)}
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'submitted', label: 'Submitted' },
            { value: 'in_review', label: 'In Review' },
            { value: 'resolved', label: 'Resolved' },
          ]}
          placeholder="Filter by status..."
        />
      </div>

      {/* Grievances List */}
      {filteredGrievances.map((grievance) => {
        const StatusIcon = statusIcons[grievance.status]
        const isUpdating = updatingGrievances.has(grievance.id)

        return (
          <Card key={grievance.id} className="bg-[#1e1e1e] rounded-2xl border border-border/50">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                        {grievance.subject}
                      </h3>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium border flex items-center gap-1 ${statusColors[grievance.status]}`}>
                        <StatusIcon className="h-3 w-3" />
                        {grievance.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <User className="h-4 w-4" />
                        <span>{grievance.user.name}</span>
                        {grievance.user.site && (
                          <span className="text-xs">({grievance.user.site})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(grievance.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grievance Details */}
                <div className="space-y-3 pt-2 border-t border-border/50">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">Employee Name:</h4>
                    <p className="text-sm text-muted-foreground">{grievance.employeeName}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">What the grievance is:</h4>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{grievance.content}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">How it relates to employment:</h4>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{grievance.relatesToEmployment}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">How the problem could be resolved:</h4>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{grievance.howToResolve}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">Other parties involved:</h4>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{grievance.otherParties}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">What has been done to date:</h4>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{grievance.whatHasBeenDone}</p>
                  </div>
                </div>

                {/* Status Update Controls */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
                  <span className="text-sm text-muted-foreground">Update Status:</span>
                  <Select
                    value={grievance.status}
                    onChange={(value) => handleStatusUpdate(grievance.id, value as typeof grievance.status)}
                    options={[
                      { value: 'submitted', label: 'Submitted' },
                      { value: 'in_review', label: 'In Review' },
                      { value: 'resolved', label: 'Resolved' },
                    ]}
                    disabled={isUpdating}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
