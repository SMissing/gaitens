import { headers } from 'next/headers'
import { GlobalDock } from './GlobalDock'

export async function ConditionalDock() {
  const headersList = await headers()
  const referer = headersList.get('referer') || ''
  const url = headersList.get('x-url') || headersList.get('x-invoke-path') || ''
  
  // Check if we're on the social page
  // Since we can't easily get pathname in server component, we'll use a different approach
  // We'll check in the layout or use a client-side check
  
  return <GlobalDock />
}
