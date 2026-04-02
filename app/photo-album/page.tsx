import { requireAuth } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { PageHeader } from '@/components/layout/PageHeader'
import { Image as ImageIcon } from 'lucide-react'
import { PhotoAlbumClient } from '@/components/photo-album/PhotoAlbumClient'

export default async function PhotoAlbumPage() {
  const user = await requireAuth()
  const supabase = createServerClient()

  // Fetch photos
  const { data: photos, error: photosError } = await supabase
    .from('photo_albums')
    .select(`
      id,
      imageUrl,
      title,
      description,
      weekendDate,
      createdAt,
      users:uploadedBy (
        id,
        name,
        site
      )
    `)
    .order('createdAt', { ascending: false })

  if (photosError) {
    console.error('Error fetching photos:', photosError)
  }

  // Transform the data to match component expectations
  // Supabase returns the relationship as 'users', but component expects 'uploadedBy'
  const transformedPhotos = (photos || []).map((photo: any) => {
    // Handle the relationship - Supabase returns it as 'users' (the alias)
    // It could be an object or null (not an array for foreign key relationships)
    const userData = Array.isArray(photo.users) ? photo.users[0] : photo.users
    
    return {
      id: photo.id,
      imageUrl: photo.imageUrl,
      title: photo.title,
      description: photo.description,
      weekendDate: photo.weekendDate,
      createdAt: photo.createdAt,
      uploadedBy: userData ? {
        id: userData.id,
        name: userData.name,
        site: userData.site ?? null,
      } : { id: '', name: 'Unknown', site: null }
    }
  })

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="Photo Album"
        icon={<ImageIcon className="h-6 w-6 text-spirits-cyan" />}
        description="Staff photo history from weekend gatherings"
        showBack={true}
        backHref="/dashboard"
      />
      <div className="p-4 sm:p-6 lg:p-8 pb-32">
        <div className="max-w-7xl mx-auto">
          <PhotoAlbumClient 
            initialPhotos={transformedPhotos as any}
            isAdmin={user.role === 'admin'}
            canUpload={user.role === 'admin' || user.role === 'manager'}
          />
        </div>
      </div>
    </div>
  )
}
