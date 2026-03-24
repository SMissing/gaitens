'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import type { BarDurationUnit } from '@/types/database'
import { Image as ImageIcon, Upload, X } from 'lucide-react'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

interface BarredPersonFormProps {
  onCreated: () => void
}

export function BarredPersonForm({ onCreated }: BarredPersonFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [reason, setReason] = useState('')
  const [barDurationValue, setBarDurationValue] = useState<number>(1)
  const [barDurationUnit, setBarDurationUnit] = useState<BarDurationUnit>('months')

  const unitOptions = useMemo(
    () => [
      { value: 'days', label: 'Days' },
      { value: 'weeks', label: 'Weeks' },
      { value: 'months', label: 'Months' },
      { value: 'years', label: 'Years' },
      { value: 'life', label: 'Life' },
    ],
    []
  )

  const isLifeBar = barDurationUnit === 'life'

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleFileChange = (file: File | null) => {
    setError(null)
    setSelectedFile(file)

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    if (!file) {
      setPreviewUrl(null)
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.')
      setSelectedFile(null)
      setPreviewUrl(null)
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('Image must be less than 10MB.')
      setSelectedFile(null)
      setPreviewUrl(null)
      return
    }

    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    setError(null)

    if (!selectedFile) {
      setError('Please add a photo.')
      return
    }
    if (!reason.trim()) {
      setError('Reason is required.')
      return
    }
    if (
      !isLifeBar &&
      (!Number.isFinite(barDurationValue) || barDurationValue <= 0)
    ) {
      setError('Length must be a positive number.')
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      if (name.trim()) formData.append('name', name.trim())
      formData.append('reason', reason.trim())
      formData.append('barDurationValue', isLifeBar ? '1' : String(barDurationValue))
      formData.append('barDurationUnit', barDurationUnit)

      const response = await fetch('/api/barred/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || 'Failed to create barred person.')
      }

      // Reset form
      setName('')
      setReason('')
      setBarDurationValue(1)
      setBarDurationUnit('months')
      setSelectedFile(null)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
      if (fileInputRef.current) fileInputRef.current.value = ''

      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create barred person.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-3 p-4 sm:p-6 border border-border/50 rounded-2xl bg-card/40">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-spirits-magenta flex-shrink-0" />
            <h3 className="text-lg font-bold text-foreground">Add a barred person</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Post a photo + reason and set the bar length.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: image */}
        <div className="space-y-2">
          <Label htmlFor="barred-photo">Photo</Label>
          <input
            id="barred-photo"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            disabled={submitting}
          />

          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {selectedFile ? 'Change photo' : 'Choose photo'}
          </Button>

          {previewUrl && (
            <div className="relative bg-muted rounded-xl overflow-hidden border border-border/30">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-48 object-contain select-none pointer-events-none"
                draggable={false}
              />
              <button
                type="button"
                onClick={() => handleFileChange(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white touch-manipulation"
                aria-label="Remove photo"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Right: fields */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="barred-name">Name (optional)</Label>
              <Input
                id="barred-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Smith"
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="barred-length">Bar length</Label>
              <div className="flex gap-2">
                <Input
                  id="barred-length"
                  type="number"
                  min={1}
                  value={barDurationValue}
                  onChange={(e) => setBarDurationValue(Number(e.target.value))}
                  disabled={submitting || isLifeBar}
                  aria-label={isLifeBar ? 'Bar length (not used for life bar)' : 'Bar length'}
                />
                <div className="w-full sm:w-40">
                  <Select
                    options={unitOptions}
                    value={barDurationUnit}
                    onChange={(value) => setBarDurationUnit(value as BarDurationUnit)}
                    placeholder="Unit"
                    disabled={submitting}
                  />
                </div>
              </div>
              {isLifeBar && (
                <p className="text-xs text-muted-foreground">
                  Permanent life bar — length does not apply.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="barred-reason">Reason for bar</Label>
            <Textarea
              id="barred-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Policy breach on 12/03/2026..."
              disabled={submitting}
            />
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full"
          >
            {submitting ? 'Posting...' : 'Post barred person'}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Max 10MB. JPG/PNG/GIF.
          </p>
        </div>
      </div>
    </div>
  )
}

