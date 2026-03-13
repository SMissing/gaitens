import { NextRequest, NextResponse } from 'next/server'

// GET - Get Instagram feed data
// Note: This is a placeholder. To enable Instagram integration:
// 1. Set up Instagram Basic Display API
// 2. Configure access tokens
// 3. Fetch posts from Instagram API
export async function GET(request: NextRequest) {
  try {
    // Return empty array for now - Instagram integration not configured
    return NextResponse.json({
      accounts: []
    })
  } catch (error) {
    console.error('Error fetching Instagram data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Instagram data' },
      { status: 500 }
    )
  }
}
