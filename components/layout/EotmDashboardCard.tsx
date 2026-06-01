import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Crown } from 'lucide-react'
import { EotmReasonRotator } from './EotmReasonRotator'

interface Winner {
  id: string
  users: { name: string; site: string | null } | Array<{ name: string; site: string | null }>
}

interface EotmDashboardCardProps {
  winners: Winner[]
  formattedMonth: string
  reasons: string[]
}

const PARTICLES: Array<{ left: number; delay: number; size: number; color: string; duration: number }> = [
  { left:  4, delay: 0.0, size: 3, color: 'var(--spirits-cyan)',    duration: 3.2 },
  { left: 12, delay: 1.1, size: 2, color: 'var(--spirits-yellow)',  duration: 2.7 },
  { left: 21, delay: 0.5, size: 3, color: 'var(--spirits-magenta)', duration: 3.5 },
  { left: 30, delay: 1.6, size: 2, color: 'var(--spirits-cyan)',    duration: 2.9 },
  { left: 39, delay: 0.3, size: 3, color: 'var(--spirits-yellow)',  duration: 3.1 },
  { left: 48, delay: 0.8, size: 2, color: 'var(--spirits-magenta)', duration: 2.6 },
  { left: 57, delay: 1.4, size: 3, color: 'var(--spirits-cyan)',    duration: 3.4 },
  { left: 66, delay: 0.1, size: 2, color: 'var(--spirits-yellow)',  duration: 2.8 },
  { left: 75, delay: 0.9, size: 3, color: 'var(--spirits-magenta)', duration: 3.0 },
  { left: 84, delay: 0.6, size: 2, color: 'var(--spirits-cyan)',    duration: 3.3 },
  { left: 92, delay: 1.8, size: 3, color: 'var(--spirits-yellow)',  duration: 2.5 },
]

export function EotmDashboardCard({ winners, formattedMonth, reasons }: EotmDashboardCardProps) {
  return (
    <Card className="border" style={{ borderColor: 'white' }}>
      {/* Falling particles — clipped by Card's overflow-hidden */}
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.left}%`,
            top: '-4px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            animation: `eotm-fall ${p.duration}s ${p.delay}s infinite linear`,
          }}
        />
      ))}

      <CardContent className="p-4 sm:p-5 relative z-10">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex flex-col items-center gap-0.5">
            <CardTitle className="text-base sm:text-lg text-center">Employees of the Month</CardTitle>
            <span className="text-xs text-muted-foreground">{formattedMonth}</span>
          </div>

          {/* Winners */}
          <div className={`grid gap-4 ${winners.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {winners.map((winner) => {
              const u = Array.isArray(winner.users) ? winner.users[0] : winner.users
              return (
                <div key={winner.id} className="flex flex-col items-center gap-1.5">
                  <Crown className="h-5 w-5 text-spirits-yellow" />
                  <p className="text-base font-bold text-foreground text-center leading-tight">{u?.name}</p>
                </div>
              )
            })}
          </div>

          <EotmReasonRotator reasons={reasons} />
        </div>
      </CardContent>
    </Card>
  )
}
