import { getCurrentUser } from '@/lib/auth'
import { Dock } from '@/components/core/dock'
import { DockButtonRow } from './DockButtonRow'
import { DockSwipeOverlay } from './DockSwipeOverlay'

export async function GlobalDock() {
  const user = await getCurrentUser()
  
  // Don't show dock on login page
  if (!user) {
    return null
  }

  return (
    <>
      {/* Gradient overlay from bottom of page - extends to middle of dock */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none"
        style={{
          height: 'calc(env(safe-area-inset-bottom, 0px) + 2.75rem)',
          background: 'linear-gradient(to top, #121212 0%, rgba(18, 18, 18, 0.95) 12%, rgba(18, 18, 18, 0.8) 25%, rgba(18, 18, 18, 0.6) 38%, rgba(18, 18, 18, 0.4) 50%, rgba(18, 18, 18, 0.2) 62%, transparent 100%)'
        }}
      />
      
      <div
        className="fixed left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-2 sm:px-4"
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 2px)' }}
      >
        <Dock className="bg-card/80 backdrop-blur-md border border-border/50 rounded-3xl shadow-2xl overflow-visible relative h-16 sm:h-20">
          {/* Dock Swipe Overlay - inside Dock for context access */}
          <DockSwipeOverlay user={user} />
          
          {/* Button Row */}
          <DockButtonRow user={user} />
        </Dock>
      </div>
    </>
  )
}
