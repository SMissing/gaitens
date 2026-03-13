'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Image as ImageIcon, Upload, X } from 'lucide-react'

interface PhotoUploadFormProps {
  onUploadSuccess: () => void
}

export function PhotoUploadForm({ onUploadSuccess }: PhotoUploadFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Validate all files
    const validFiles: File[] = []
    const errors: string[] = []

    files.forEach((file, index) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name} is not an image file`)
        return
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name} is larger than 10MB`)
        return
      }

      validFiles.push(file)
    })

    if (errors.length > 0) {
      setError(errors.join(', '))
    } else {
      setError(null)
    }

    setSelectedFiles(validFiles)
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setError(null)
  }

  const handleClearAll = () => {
    setSelectedFiles([])
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one photo')
      return
    }

    setUploading(true)
    setError(null)
    setUploadProgress({ current: 0, total: selectedFiles.length })

    try {
      // Upload files one by one
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        const uploadFormData = new FormData()
        uploadFormData.append('file', file)

        const response = await fetch('/api/photo-album/upload', {
          method: 'POST',
          body: uploadFormData,
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(`Failed to upload ${file.name}: ${data.error || 'Unknown error'}`)
        }

        setUploadProgress({ current: i + 1, total: selectedFiles.length })
      }

      // Reset form
      setSelectedFiles([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Notify parent to refresh
      onUploadSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload photos')
    } finally {
      setUploading(false)
      setUploadProgress({ current: 0, total: 0 })
    }
  }

  return (
    <div className="p-4 border border-border rounded-xl bg-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Upload Photos</h3>
        {selectedFiles.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            disabled={uploading}
            className="text-xs"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* File Input */}
      <div className="space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          id="photos"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2"
        >
          <ImageIcon className="h-4 w-4" />
          {selectedFiles.length > 0 
            ? `${selectedFiles.length} photo${selectedFiles.length > 1 ? 's' : ''} selected`
            : 'Select Photos'
          }
        </Button>

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-muted rounded-xl"
              >
                <span className="text-sm text-foreground truncate flex-1">
                  {file.name}
                </span>
                <span className="text-xs text-muted-foreground mr-2">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile(index)}
                  disabled={uploading}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Progress */}
        {uploading && uploadProgress.total > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Uploading...</span>
              <span className="text-muted-foreground">
                {uploadProgress.current} / {uploadProgress.total}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-spirits-cyan h-2 rounded-full transition-all"
                style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <Button
          type="button"
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || uploading}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading 
            ? `Uploading ${uploadProgress.current}/${uploadProgress.total}...`
            : `Upload ${selectedFiles.length} Photo${selectedFiles.length !== 1 ? 's' : ''}`
          }
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Max 10MB per photo. JPG, PNG, GIF
        </p>
      </div>
    </div>
  )
}
