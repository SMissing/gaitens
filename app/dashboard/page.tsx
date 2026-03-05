import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import DashboardContent from '@/components/layout/DashboardContent'
import LogoutButton from '@/components/layout/LogoutButton'

export default async function DashboardPage() {
  const user = await requireAuth()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="w-full bg-[oklch(0.08_0_0)]/90 backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col items-center justify-center relative">
            <div className="absolute top-0 right-0">
              <LogoutButton />
            </div>
            <img 
              src="/logos/gaitens-logo.png" 
              alt="Gaitens Leisure Group" 
              className="h-12 w-auto mb-0.5"
            />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground text-center" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.15em' }}>
              Gaitens Leisure Group
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground text-center">
              Staff Portal
            </p>
          </div>
        </div>
      </header>
      <DashboardContent user={user} />
    </div>
  )
}
