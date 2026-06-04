'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Award, Loader2, AlertCircle, CheckCircle2, Upload, X, Image as ImageIcon } from 'lucide-react'
import { CircularImageCropper } from './CircularImageCropper'

const RARITY_OPTIONS = [
  { value: 'Common', label: 'Common' },
  { value: 'Rare', label: 'Rare' },
  { value: 'Epic', label: 'Epic' },
  { value: 'Legendary', label: 'Legendary' },
]

export function CreateAchievementForm() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [requiresProgress, setRequiresProgress] = useState(false)
  const [requiredCount, setRequiredCount] = useState('1')
  const [imageUrl, setImageUrl] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showCropper, setShowCropper] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null)
  const [rarity, setRarity] = useState<string>('Common')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

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

    setError(null)
    
    // Create preview URL and show cropper
    const previewUrl = URL.createObjectURL(file)
    setImageToCrop(previewUrl)
    setOriginalImageFile(file)
    setShowCropper(true)
  }

  const handleCropComplete = async (croppedImageUrl: string) => {
    if (!originalImageFile) return

    setUploadingImage(true)
    setError(null)
    setShowCropper(false)

    try {
      // Convert cropped image URL to blob
      const response = await fetch(croppedImageUrl)
      const blob = await response.blob()
      
      // Create a file from the blob
      const file = new File([blob], originalImageFile.name, { type: 'image/png' })

      // Upload the cropped image
      const formData = new FormData()
      formData.append('file', file)

      const uploadResponse = await fetch('/api/achievements/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        const data = await uploadResponse.json()
        throw new Error(data.error || 'Failed to upload image')
      }

      const data = await uploadResponse.json()
      
      if (!data.url) {
        throw new Error('Invalid response from upload endpoint - missing url')
      }
      
      setImageUrl(data.url)
      setPreviewUrl(data.url)
      setError(null)
      
      // Clean up
      URL.revokeObjectURL(croppedImageUrl)
      if (imageToCrop) {
        URL.revokeObjectURL(imageToCrop)
      }
      setImageToCrop(null)
      setOriginalImageFile(null)
    } catch (err) {
      console.error('Image upload error:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload image')
      // Clean up on error
      URL.revokeObjectURL(croppedImageUrl)
      if (imageToCrop) {
        URL.revokeObjectURL(imageToCrop)
      }
      setImageToCrop(null)
      setOriginalImageFile(null)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleCropCancel = () => {
    setShowCropper(false)
    if (imageToCrop) {
      URL.revokeObjectURL(imageToCrop)
    }
    setImageToCrop(null)
    setOriginalImageFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveImage = () => {
    setImageUrl('')
    setPreviewUrl(null)
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url)
    // Set preview if it's a valid URL
    if (url.trim() && (url.startsWith('http://') || url.startsWith('https://'))) {
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!name.trim()) {
      setError('Name is required')
      return
    }

    const countNumber = Number(requiredCount)
    if (requiresProgress && (!Number.isFinite(countNumber) || countNumber < 1)) {
      setError('Required count must be at least 1 for progress-based badges')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/achievements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          requiresProgress,
          requiredCount: requiresProgress ? countNumber : 1,
          imageUrl: imageUrl.trim() || null,
          rarity,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create badge')
      }

      setSuccess(`Badge "${data.achievement?.name || name}" created successfully`)
      setName('')
      setDescription('')
      setRequiresProgress(false)
      setRequiredCount('1')
      setImageUrl('')
      setPreviewUrl(null)
      setRarity('Common')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      setTimeout(() => {
        router.push('/achievements')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-card/60 backdrop-blur-md rounded-2xl border border-border/30 shadow-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-spirits-cyan/20 rounded-xl">
            <Award className="h-6 w-6 text-spirits-cyan" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Create Badge</h2>
            <p className="text-sm text-muted-foreground">
              Define a new achievement badge that managers can award to staff.
            </p>
          </div>
        </div>

        {/* ── Identity ─────────────────────────────────── */}
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Identity</p>
          <div className="space-y-2">
            <Label htmlFor="name">Badge Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Clean the ice machine"
              disabled={loading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description of what this badge is for"
              disabled={loading}
            />
          </div>
        </div>

        <div className="border-t border-border/40" />

        {/* ── Appearance ───────────────────────────────── */}
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Appearance</p>
          <div className="space-y-2">
            <Label>Rarity</Label>
            <Select
              options={RARITY_OPTIONS}
              value={rarity}
              onChange={(value) => setRarity(value)}
              disabled={loading}
              placeholder="Choose rarity"
            />
          </div>

        <div className="space-y-3">
          <Label>Badge Image (optional)</Label>
          
          {/* Circular Image Cropper - Full Screen */}
          {showCropper && imageToCrop && (
            <CircularImageCropper
              imageUrl={imageToCrop}
              onCrop={handleCropComplete}
              onCancel={handleCropCancel}
            />
          )}
          
          {/* Image Preview */}
          {previewUrl && !showCropper && (
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full border-2 border-border overflow-hidden bg-muted/20 flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="Badge preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const img = e.currentTarget
                    img.style.display = 'none'
                    const parent = img.parentElement
                    if (parent) {
                      parent.innerHTML = '<div class="text-muted-foreground text-xs p-2 text-center">Failed to load image</div>'
                    }
                  }}
                />
              </div>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                disabled={loading || uploadingImage}
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Upload Button */}
          {!previewUrl && !showCropper && (
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={loading || uploadingImage}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading || uploadingImage}
                className="w-full"
              >
                {uploadingImage ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload & Crop Image
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Or URL Input */}
          {!showCropper && (
            <div className="space-y-2">
              <Label htmlFor="imageUrl" className="text-sm text-muted-foreground">
                Or enter image URL
              </Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => handleImageUrlChange(e.target.value)}
                placeholder="https://..."
                disabled={loading || uploadingImage}
              />
            </div>
          )}
        </div>
        </div>{/* end Appearance */}

        <div className="border-t border-border/40" />

        {/* ── Behaviour ────────────────────────────────── */}
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Behaviour</p>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <Label htmlFor="requiresProgress">Progress-based badge</Label>
              <p className="text-xs text-muted-foreground">
                Use this for badges that require multiple actions (e.g. 3 reviews, 5 shifts).
              </p>
            </div>
            <button
              type="button"
              onClick={() => setRequiresProgress((prev) => !prev)}
              className="relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer items-center rounded-full border border-border bg-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-pressed={requiresProgress}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-foreground shadow transition-transform ${
                  requiresProgress ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {requiresProgress && (
            <div className="space-y-2">
              <Label htmlFor="requiredCount">Number required to complete</Label>
              <Input
                id="requiredCount"
                type="number"
                min={1}
                value={requiredCount}
                onChange={(e) => setRequiredCount(e.target.value)}
                disabled={loading}
              />
            </div>
          )}
        </div>
        </div>{/* end Behaviour */}

        {error && (
          <div className="p-3 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-xl border border-green-500/40 bg-green-500/10 text-green-500 flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            disabled={loading || !name.trim()}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Award className="h-4 w-4" />
                Create Badge
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => router.push('/achievements')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}

