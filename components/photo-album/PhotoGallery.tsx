'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Trash2, User, X } from 'lucide-react'
import { formatDate } from '@/lib/date-utils'
import { formatStaffNameAndVenue } from '@/lib/staff-display'

interface Photo {
  id: string
  imageUrl: string
  title: string | null
  description: string | null
  weekendDate: string | null
  createdAt: string
  uploadedBy: {
    id: string
    name: string
    site: string | null
  }
}

interface PhotoGalleryProps {
  photos: Photo[]
  isAdmin: boolean
  onDelete: (photoId: string) => void
}

export function PhotoGallery({ photos, isAdmin, onDelete }: PhotoGalleryProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

  const handleDelete = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) {
      return
    }

    setDeletingId(photoId)
    try {
      const response = await fetch(`/api/photo-album?id=${photoId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete photo')
      }

      onDelete(photoId)
    } catch (error) {
      alert('Failed to delete photo. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No photos yet. Check back soon!</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="group relative rounded-xl overflow-hidden cursor-pointer"
            onClick={() => setSelectedPhoto(photo)}
          >
            <div className="relative aspect-square bg-muted">
              <Image
                src={photo.imageUrl}
                alt={photo.title || 'Photo'}
                fill
                className="object-cover"
                sizes="33vw"
              />
            </div>
            {isAdmin && (
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(photo.id)
                }}
                disabled={deletingId === photo.id}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh]">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setSelectedPhoto(null)}
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="relative w-full h-[80vh] bg-muted rounded-lg overflow-hidden">
              <Image
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title || 'Photo'}
                fill
                className="object-contain"
              />
            </div>
            <div className="mt-4 bg-card p-4 rounded-lg">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Uploaded by{' '}
                  {formatStaffNameAndVenue(
                    selectedPhoto.uploadedBy.name,
                    selectedPhoto.uploadedBy.site,
                  )}
                </div>
                <div>
                  {formatDate(selectedPhoto.createdAt)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
