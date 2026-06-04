'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FileText, AlertCircle, ShieldOff } from 'lucide-react'

interface GrievanceFormProps {
  onSuccess?: () => void
}

export function GrievanceForm({ onSuccess }: GrievanceFormProps) {
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [employeeName, setEmployeeName] = useState('')
  const [relatesToEmployment, setRelatesToEmployment] = useState('')
  const [howToResolve, setHowToResolve] = useState('')
  const [otherParties, setOtherParties] = useState('')
  const [whatHasBeenDone, setWhatHasBeenDone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!subject.trim() || !content.trim() || !employeeName.trim() || 
        !relatesToEmployment.trim() || !howToResolve.trim() || 
        !otherParties.trim() || !whatHasBeenDone.trim()) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/grievances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: subject.trim(),
          content: content.trim(),
          employeeName: employeeName.trim(),
          relatesToEmployment: relatesToEmployment.trim(),
          howToResolve: howToResolve.trim(),
          otherParties: otherParties.trim(),
          whatHasBeenDone: whatHasBeenDone.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit grievance')
      }

      // Show success message
      setSubmitted(true)
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit grievance')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <Card className="bg-[#1e1e1e] rounded-2xl border border-border/50">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-green-500/20 rounded-full">
              <AlertCircle className="h-8 w-8 text-green-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Grievance Submitted</h3>
              <p className="text-muted-foreground">
                Your grievance has been submitted successfully. It will be reviewed by management and kept confidential.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[#1e1e1e] rounded-2xl border border-border/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-garrison-orange flex-shrink-0" />
          <div>
            <CardTitle className="text-xl sm:text-2xl">File a Grievance</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              All grievances are kept confidential and handled professionally
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: About you */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">About You</p>
            <div>
              <Label htmlFor="employeeName">Your name *</Label>
              <Input
                id="employeeName"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="Your full name"
                maxLength={100}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of the grievance"
                maxLength={200}
                className="mt-1"
                required
              />
            </div>
          </div>

          <div className="border-t border-border/30" />

          {/* Section 2: The grievance */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">The Grievance</p>
            <div>
              <Label htmlFor="content">What happened? *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Describe the grievance in detail..."
                rows={4}
                maxLength={2000}
                className="mt-1 resize-none"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">{content.length}/2000 characters</p>
            </div>
            <div>
              <Label htmlFor="relatesToEmployment">How does it relate to your employment? *</Label>
              <Textarea
                id="relatesToEmployment"
                value={relatesToEmployment}
                onChange={(e) => setRelatesToEmployment(e.target.value)}
                placeholder="Explain how this grievance relates to your employment..."
                rows={3}
                maxLength={1000}
                className="mt-1 resize-none"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">{relatesToEmployment.length}/1000 characters</p>
            </div>
            <div>
              <Label htmlFor="otherParties">Who else is involved? *</Label>
              <Textarea
                id="otherParties"
                value={otherParties}
                onChange={(e) => setOtherParties(e.target.value)}
                placeholder="List all parties involved in this grievance..."
                rows={2}
                maxLength={500}
                className="mt-1 resize-none"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">{otherParties.length}/500 characters</p>
            </div>
          </div>

          <div className="border-t border-border/30" />

          {/* Section 3: Resolution */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Resolution</p>
            <div>
              <Label htmlFor="whatHasBeenDone">What steps have already been taken? *</Label>
              <Textarea
                id="whatHasBeenDone"
                value={whatHasBeenDone}
                onChange={(e) => setWhatHasBeenDone(e.target.value)}
                placeholder="Describe any steps you've already taken to resolve this issue..."
                rows={3}
                maxLength={1000}
                className="mt-1 resize-none"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">{whatHasBeenDone.length}/1000 characters</p>
            </div>
            <div>
              <Label htmlFor="howToResolve">What outcome would you like? *</Label>
              <Textarea
                id="howToResolve"
                value={howToResolve}
                onChange={(e) => setHowToResolve(e.target.value)}
                placeholder="Suggest how you think this issue could be resolved..."
                rows={3}
                maxLength={1000}
                className="mt-1 resize-none"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">{howToResolve.length}/1000 characters</p>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full bg-[#1e1e1e] hover:bg-[#262626] rounded-2xl">
            {loading ? 'Submitting...' : 'Submit Grievance'}
          </Button>

          <Link
            href="/anonymous-report?confirmed=true"
            className="flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors pt-1"
          >
            <ShieldOff className="h-3.5 w-3.5 flex-shrink-0" />
            Submit anonymously instead
          </Link>
        </form>
      </CardContent>
    </Card>
  )
}
