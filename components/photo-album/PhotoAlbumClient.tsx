'use client'

import { useState, useEffect } from 'react'
import { PhotoUploadForm } from './PhotoUploadForm'
import { PhotoGallery } from './PhotoGallery'

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
    staffCode: string
  }
}

interface PhotoAlbumClientProps {
  initialPhotos: Photo[]
  isAdmin: boolean
}

export function PhotoAlbumClient({ initialPhotos, isAdmin }: PhotoAlbumClientProps) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)
  const [refreshKey, setRefreshKey] = useState(0)

  // Fetch photos on mount if initialPhotos is empty (fallback)
  useEffect(() => {
    if (initialPhotos.length === 0) {
      fetch('/api/photo-album')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setPhotos(data)
          }
        })
        .catch(err => console.error('Error fetching photos:', err))
    }
  }, [initialPhotos.length])

  const handleUploadSuccess = async () => {
    // Refresh photos
    const response = await fetch('/api/photo-album')
    if (response.ok) {
      const newPhotos = await response.json()
      setPhotos(newPhotos)
    }
    setRefreshKey(prev => prev + 1)
  }

  const handleDelete = (photoId: string) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId))
  }

  return (
    <div className="space-y-6">
      {isAdmin && (
        <div className="mb-6">
          <PhotoUploadForm onUploadSuccess={handleUploadSuccess} />
        </div>
      )}
      <PhotoGallery 
        photos={photos} 
        isAdmin={isAdmin}
        onDelete={handleDelete}
      />
    </div>
  )
}
