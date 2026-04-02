'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { TabletSmartphone, X } from 'lucide-react'
import { fetchWithAuth } from '@/lib/fetch-with-auth'
import type { AppFeedbackCategory } from '@/types/database'

interface AppFeedbackFormProps {
  onSuccess?: () => void
  onSubmitted?: () => void
  onClose?: () => void
}

export function AppFeedbackForm({ onSuccess, onSubmitted, onClose }: AppFeedbackFormProps) {
  const [category, setCategory] = useState<AppFeedbackCategory>('feature')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim() || !description.trim()) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const response = await fetchWithAuth('/api/app-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          title: title.trim(),
          description: description.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit')
      }

      setCategory('feature')
      setTitle('')
      setDescription('')
      setError(null)
      onSuccess?.()
      onSubmitted?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-[#1e1e1e] rounded-2xl border border-border/50 relative">
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
        >
          <X className="h-5 w-5" />
        </button>
      )}
      <CardHeader>
        <div className="flex items-center gap-3">
          <TabletSmartphone className="h-6 w-6 text-spirits-cyan flex-shrink-0" />
          <div>
            <CardTitle className="text-xl sm:text-2xl">App feedback</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Suggest a feature, report an issue, or ask a question about this app
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="app-feedback-type">Type</Label>
            <Select
              id="app-feedback-type"
              value={category}
              onChange={(value) => setCategory(value as AppFeedbackCategory)}
              options={[
                { value: 'feature', label: 'Feature idea' },
                { value: 'issue', label: 'Issue / bug' },
                { value: 'question', label: 'Question' },
              ]}
              placeholder="Select type"
            />
          </div>

          <div>
            <Label htmlFor="app-feedback-title">Title</Label>
            <Input
              id="app-feedback-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short summary"
              maxLength={200}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="app-feedback-description">Details</Label>
            <Textarea
              id="app-feedback-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you need or what went wrong…"
              rows={6}
              maxLength={2000}
              className="mt-1 resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {description.length}/2000 characters
            </p>
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1e1e1e] hover:bg-[#262626] rounded-2xl"
          >
            {loading ? 'Submitting…' : 'Submit'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
