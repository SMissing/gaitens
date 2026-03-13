'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Calendar, CheckCircle, Clock } from 'lucide-react'
import { formatDate } from '@/lib/date-utils'

interface AnonymousReport {
  id: string
  note: string
  reportDate: string
  status: 'submitted' | 'in_review' | 'resolved'
  createdAt: string
  updatedAt: string
}

interface AnonymousReportsListProps {
  initialReports: AnonymousReport[]
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

export function AnonymousReportsList({ initialReports }: AnonymousReportsListProps) {
  const [reports, setReports] = useState<AnonymousReport[]>(initialReports)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [updatingReports, setUpdatingReports] = useState<Set<string>>(new Set())

  const handleStatusUpdate = async (reportId: string, newStatus: 'submitted' | 'in_review' | 'resolved') => {
    setUpdatingReports(prev => new Set(prev).add(reportId))

    try {
      const response = await fetch(`/api/anonymous-reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      const data = await response.json()

      // Update local state
      setReports(prev =>
        prev.map(r =>
          r.id === reportId
            ? { ...r, status: newStatus, updatedAt: data.report.updatedAt }
            : r
        )
      )
    } catch (error) {
      console.error('Failed to update report status:', error)
      alert('Failed to update report status')
    } finally {
      setUpdatingReports(prev => {
        const next = new Set(prev)
        next.delete(reportId)
        return next
      })
    }
  }

  const filteredReports = statusFilter === 'all'
    ? reports
    : reports.filter(r => r.status === statusFilter)

  if (reports.length === 0) {
    return (
      <Card className="bg-[#1e1e1e] rounded-2xl border border-border/50">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No anonymous reports submitted yet.</p>
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

      {/* Reports List */}
      {filteredReports.map((report) => {
        const StatusIcon = statusIcons[report.status]
        const isUpdating = updatingReports.has(report.id)

        return (
          <Card key={report.id} className="bg-[#1e1e1e] rounded-2xl border border-border/50">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium border flex items-center gap-1 ${statusColors[report.status]}`}>
                        <StatusIcon className="h-3 w-3" />
                        {report.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <span>Report Date: {formatDate(report.reportDate)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <span>Submitted: {formatDate(report.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Report Note */}
                <div className="space-y-3 pt-2 border-t border-border/50">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">Note:</h4>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{report.note}</p>
                  </div>
                </div>

                {/* Status Update Controls */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
                  <span className="text-sm text-muted-foreground">Update Status:</span>
                  <Select
                    value={report.status}
                    onChange={(value) => handleStatusUpdate(report.id, value as typeof report.status)}
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
