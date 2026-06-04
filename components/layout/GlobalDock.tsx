import { getCurrentUser } from '@/lib/auth'
import { Dock } from '@/components/core/dock'
import { DockButtonRow } from './DockButtonRow'
import { DockSwipeOverlay } from './DockSwipeOverlay'
import { DockTooltipHint } from './DockTooltipHint'
import { DockContextLabel } from './DockContextLabel'
import { DockPageDots } from './DockPageDots'

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
        {/* Page indicator dots — shows when a context dock is available */}
        <DockPageDots />
        <Dock className="relative h-16 min-w-0 max-w-full overflow-visible rounded-3xl border border-border/50 bg-card/80 shadow-2xl backdrop-blur-md sm:h-20">
          {/* Context label — shows above dock when in a non-main-nav state */}
          <DockContextLabel />

          {/* First-session hint — one-time tooltip above dock */}
          <DockTooltipHint />

          {/* Dock Swipe Overlay - inside Dock for context access */}
          <DockSwipeOverlay user={user} />

          {/* Button Row */}
          <DockButtonRow user={user} />
        </Dock>
      </div>
    </>
  )
}
