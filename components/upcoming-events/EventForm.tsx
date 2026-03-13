'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, X, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface Event {
  id: string
  title: string
  description: string | null
  eventDate: string
  eventTime: string | null
  location: string | null
  imageUrl: string | null
  imagePath: string | null
}

interface EventFormProps {
  event?: Event | null
  onSuccess: () => void
  onCancel?: () => void
}

export function EventForm({ event, onSuccess, onCancel }: EventFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState(event?.title || '')
  const [description, setDescription] = useState(event?.description || '')
  const [eventDate, setEventDate] = useState(event?.eventDate || '')
  const [eventTime, setEventTime] = useState(event?.eventTime || '')
  const [location, setLocation] = useState(event?.location || '')
  const [imageUrl, setImageUrl] = useState<string | null>(event?.imageUrl || null)
  const [imagePath, setImagePath] = useState<string | null>(event?.imagePath || null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(event?.imageUrl || null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setDescription(event.description || '')
      setEventDate(event.eventDate)
      setEventTime(event.eventTime || '')
      setLocation(event.location || '')
      setImageUrl(event.imageUrl || null)
      setImagePath(event.imagePath || null)
      setPreviewUrl(event.imageUrl || null)
    }
  }, [event])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB')
      return
    }

    setUploadingImage(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upcoming-events/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to upload image')
      }

      const data = await response.json()
      console.log('Upload response:', data)
      
      if (!data.url || !data.path) {
        console.error('Invalid upload response:', data)
        throw new Error('Invalid response from upload endpoint - missing url or path')
      }
      
      setImageUrl(data.url)
      setImagePath(data.path)
      setPreviewUrl(data.url)
      setError(null) // Clear any previous errors
    } catch (err) {
      console.error('Image upload error:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = () => {
    setImageUrl(null)
    setImagePath(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Please enter a title')
      return
    }

    if (!eventDate) {
      setError('Please select an event date')
      return
    }

    setLoading(true)

    try {
      const url = event ? `/api/upcoming-events/${event.id}` : '/api/upcoming-events'
      const method = event ? 'PATCH' : 'POST'

      const requestBody = {
        title: title.trim(),
        description: description.trim() || null,
        eventDate,
        eventTime: eventTime.trim() || null,
        location: location.trim() || null,
        imageUrl: imageUrl || null,
        imagePath: imagePath || null,
      }

      console.log('Submitting event with data:', requestBody)

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Error response:', data)
        throw new Error(data.error || `Failed to ${event ? 'update' : 'create'} event`)
      }

      // Show success message
      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        if (!event) {
          // Reset form for new events
          setTitle('')
          setDescription('')
          setEventDate('')
          setEventTime('')
          setLocation('')
          setImageUrl(null)
          setImagePath(null)
          setPreviewUrl(null)
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
        }
        onSuccess()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${event ? 'update' : 'create'} event`)
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
            Event {event ? 'Updated' : 'Created'} Successfully
          </h3>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[#1e1e1e] rounded-2xl border border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">
              {event ? 'Edit Event' : 'Create Upcoming Event'}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {event ? 'Update event details' : 'Add a new upcoming event'}
            </CardDescription>
          </div>
          {onCancel && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., UV Party, A-Level Result Night, Freshers Week"
              maxLength={200}
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="eventDate">Event Date *</Label>
            <Input
              id="eventDate"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="eventTime">Event Time (Optional)</Label>
            <Input
              id="eventTime"
              type="time"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="location">Location (Optional)</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Main Bar, Function Room"
              maxLength={200}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details about the event..."
              rows={4}
              maxLength={2000}
              className="mt-1 resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {description.length}/2000 characters
            </p>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">Event Photo (Optional)</Label>
            {previewUrl ? (
              <div className="relative rounded-xl border border-input overflow-hidden">
                <div className="relative w-full h-64 bg-muted">
                  <Image
                    src={previewUrl}
                    alt="Event preview"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2"
                >
                  <X className="h-4 w-4" />
                </Button>
                {imageUrl && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Photo uploaded successfully
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage || loading}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage || loading}
                    className="flex items-center gap-2"
                  >
                    <ImageIcon className="h-4 w-4" />
                    {uploadingImage ? 'Uploading...' : 'Upload Photo'}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Max 10MB. JPG, PNG, GIF
                  </p>
                </div>
                {uploadingImage && (
                  <p className="text-xs text-muted-foreground">
                    Uploading image...
                  </p>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? (event ? 'Updating...' : 'Creating...') : (event ? 'Update Event' : 'Create Event')}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
