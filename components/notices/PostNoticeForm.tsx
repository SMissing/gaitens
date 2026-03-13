'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Page } from '@/components/layout/Page'
import { ArrowLeft, Save, FileText, X, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import type { Notice } from '@/types/database'

interface PostNoticeFormProps {
  notice?: Notice
}

export function PostNoticeForm({ notice }: PostNoticeFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isEditing = !!notice
  
  // Format datetime-local value from ISO string
  const formatDateTimeLocal = (isoString: string | null) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const [formData, setFormData] = useState({
    title: notice?.title || '',
    content: notice?.content || '',
    expiresAt: notice?.expiresAt ? formatDateTimeLocal(notice.expiresAt) : '',
    pinned: notice?.pinned || false,
  })
  const [imageUrl, setImageUrl] = useState<string | null>(
    notice?.attachments && notice.attachments.length > 0 ? notice.attachments[0] : null
  )
  const [uploadingImage, setUploadingImage] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    setUploadingImage(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/notices/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to upload image')
      }

      const data = await response.json()
      setImageUrl(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = () => {
    setImageUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const url = isEditing ? `/api/notices/${notice.id}` : '/api/notices'
      const method = isEditing ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          expiresAt: formData.expiresAt || null,
          attachments: imageUrl ? [imageUrl] : null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `Failed to ${isEditing ? 'update' : 'create'} notice`)
      }

      // Redirect to notices page
      router.push('/notices')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Page>
      <div className="space-y-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              placeholder="Enter notice title"
              className="text-lg"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              required
              placeholder="Enter notice content..."
              rows={8}
              className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-y min-h-[200px]"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">Image (Optional)</Label>
            {imageUrl ? (
              <div className="relative rounded-xl border border-input overflow-hidden">
                <div className="relative w-full h-64 bg-muted">
                  <Image
                    src={imageUrl}
                    alt="Notice preview"
                    fill
                    className="object-contain"
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
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="flex items-center gap-2"
                >
                  <ImageIcon className="h-4 w-4" />
                  {uploadingImage ? 'Uploading...' : 'Upload Image'}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Max 5MB. JPG, PNG, GIF
                </p>
              </div>
            )}
          </div>

          {/* Expiration Date */}
          <div className="space-y-2">
            <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
            <Input
              id="expiresAt"
              type="datetime-local"
              value={formData.expiresAt}
              onChange={(e) =>
                setFormData({ ...formData, expiresAt: e.target.value })
              }
            />
            <p className="text-xs text-muted-foreground">
              Leave empty for notices that don't expire
            </p>
          </div>

          {/* Pinned */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="pinned"
              checked={formData.pinned}
              onChange={(e) =>
                setFormData({ ...formData, pinned: e.target.checked })
              }
              className="h-4 w-4 rounded border-input bg-background text-primary focus:ring-2 focus:ring-ring"
            />
            <Label htmlFor="pinned" className="cursor-pointer">
              Pin this notice (will appear at the top)
            </Label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border/50">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none"
            >
              <Save className="h-4 w-4" />
              {loading ? (isEditing ? 'Updating...' : 'Posting...') : (isEditing ? 'Update Notice' : 'Post Notice')}
            </Button>
            <Link href="/dashboard">
              <Button type="button" variant="outline" disabled={loading}>
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </Page>
  )
}
