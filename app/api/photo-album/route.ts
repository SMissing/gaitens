import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireAdmin } from '@/lib/auth'
import { createServerClient, createAdminClient } from '@/lib/db'

// GET - Fetch all photos
export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    const supabase = createServerClient()

    const { searchParams } = new URL(request.url)
    const weekendDate = searchParams.get('weekendDate')

    let query = supabase
      .from('photo_albums')
      .select(`
        *,
        users:uploadedBy (
          id,
          name,
          site
        )
      `)
      .order('createdAt', { ascending: false })

    if (weekendDate) {
      query = query.eq('weekendDate', weekendDate)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching photos:', error)
      return NextResponse.json(
        { error: 'Failed to fetch photos' },
        { status: 500 }
      )
    }

    // Transform the data to match component expectations
    // Supabase returns the relationship as 'users', but component expects 'uploadedBy'
    const transformedData = (data || []).map((photo: any) => {
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
    return NextResponse.json(transformedData)
  } catch (error) {
    console.error('Error in GET /api/photo-album:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}

// DELETE - Delete a photo (admin only)
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin()
    // Try to use admin client (bypasses RLS), fallback to regular client
    let supabase
    try {
      supabase = createAdminClient()
    } catch {
      // Fallback to regular client if service key not available
      supabase = createServerClient()
    }

    const { searchParams } = new URL(request.url)
    const photoId = searchParams.get('id')

    if (!photoId) {
      return NextResponse.json(
        { error: 'Photo ID is required' },
        { status: 400 }
      )
    }

    // Get photo metadata to delete the file
    const { data: photo, error: fetchError } = await supabase
      .from('photo_albums')
      .select('imagePath')
      .eq('id', photoId)
      .single()

    if (fetchError || !photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      )
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('photo-albums')
      .remove([photo.imagePath])

    if (storageError) {
      console.error('Error deleting file from storage:', storageError)
      // Continue with database deletion even if storage deletion fails
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('photo_albums')
      .delete()
      .eq('id', photoId)

    if (deleteError) {
      console.error('Error deleting photo:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete photo' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/photo-album:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
