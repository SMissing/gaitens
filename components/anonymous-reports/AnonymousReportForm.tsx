'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { CheckCircle } from 'lucide-react'

interface AnonymousReportFormProps {
  onSuccess?: () => void
}

export function AnonymousReportForm({ onSuccess }: AnonymousReportFormProps) {
  const [note, setNote] = useState('')
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!note.trim()) {
      setError('Please enter a note')
      return
    }

    if (!reportDate) {
      setError('Please select a date')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/anonymous-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          note: note.trim(),
          reportDate,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit report')
      }

      // Show success message
      setSubmitted(true)
      setNote('')
      setReportDate(new Date().toISOString().split('T')[0])
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report')
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
            Report Submitted Successfully
          </h3>
          <p className="text-muted-foreground mb-4">
            Your anonymous report has been submitted. Administrators will review it shortly.
          </p>
          <Button
            onClick={() => setSubmitted(false)}
            variant="outline"
          >
            Submit Another Report
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[#1e1e1e] rounded-2xl border border-border/50">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-foreground">
          Submit Anonymous Report
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Submit a confidential report to administrators. Your identity will remain anonymous.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="reportDate">Date *</Label>
            <Input
              id="reportDate"
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="note">Note *</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Describe the issue or concern..."
              rows={6}
              maxLength={2000}
              className="mt-1 resize-none"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              {note.length}/2000 characters
            </p>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
