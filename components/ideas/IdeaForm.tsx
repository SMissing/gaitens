'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Lightbulb, X } from 'lucide-react'

interface IdeaFormProps {
  onSuccess?: () => void
  onIdeaSubmitted?: () => void
  onClose?: () => void
}

export function IdeaForm({ onSuccess, onIdeaSubmitted, onClose }: IdeaFormProps) {
  const [venue, setVenue] = useState<'Garrison' | 'Spirits' | 'Bassment' | 'All'>('All')
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
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          venue,
          title: title.trim(),
          description: description.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit idea')
      }

      // Reset form
      setVenue('All')
      setTitle('')
      setDescription('')
      setError(null)
      onSuccess?.()
      onIdeaSubmitted?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit idea')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-[#1e1e1e] rounded-2xl border border-border/50 relative">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
        >
          <X className="h-5 w-5" />
        </button>
      )}
      <CardHeader>
        <div className="flex items-center gap-3">
          <Lightbulb className="h-6 w-6 text-spirits-yellow flex-shrink-0" />
          <div>
            <CardTitle className="text-xl sm:text-2xl">Submit an Idea</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Share your ideas to improve our businesses
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="venue">Venue</Label>
            <Select
              id="venue"
              value={venue}
              onChange={(value) => setVenue(value as typeof venue)}
              options={[
                { value: 'All', label: 'All Venues' },
                { value: 'Garrison', label: 'Garrison' },
                { value: 'Spirits', label: 'Spirits Bar & Games' },
                { value: 'Bassment', label: 'Bassment' },
              ]}
              placeholder="Select venue"
            />
          </div>

          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief title for your idea"
              maxLength={200}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your idea in detail..."
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

          <Button type="submit" disabled={loading} className="w-full bg-[#1e1e1e] hover:bg-[#262626] rounded-2xl">
            {loading ? 'Submitting...' : 'Submit Idea'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
