import { requireAuth } from '@/lib/auth'
import { TrainingContentClient } from '@/components/training/TrainingContentClient'

export default async function TrainingPage() {
  const user = await requireAuth()

  return (
    <div className="min-h-screen relative" style={{ background: '#0c0c1e' }}>

      {/* ── Gradient hero backdrop ────────────────────────────────── */}
      <div
        className="absolute inset-x-0 top-0 h-96 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, #1e0a5e 0%, #0d1b52 35%, #0c0c1e 100%)',
        }}
      />

      {/* Decorative watermark */}
      <div
        className="absolute top-0 right-0 text-[220px] leading-none select-none pointer-events-none"
        style={{ opacity: 0.035 }}
        aria-hidden
      >
        🎓
      </div>

      {/* Subtle star field — a few hand-placed dots */}
      <div className="absolute inset-x-0 top-0 h-96 pointer-events-none overflow-hidden" aria-hidden>
        {[
          { top: '12%', left: '8%',  size: 2, opacity: 0.4 },
          { top: '7%',  left: '22%', size: 1, opacity: 0.3 },
          { top: '20%', left: '38%', size: 1.5, opacity: 0.25 },
          { top: '5%',  left: '55%', size: 2, opacity: 0.35 },
          { top: '15%', left: '70%', size: 1, opacity: 0.3 },
          { top: '28%', left: '82%', size: 2, opacity: 0.2 },
          { top: '9%',  left: '91%', size: 1.5, opacity: 0.35 },
          { top: '33%', left: '15%', size: 1, opacity: 0.2 },
          { top: '38%', left: '50%', size: 1.5, opacity: 0.15 },
          { top: '22%', left: '60%', size: 1, opacity: 0.25 },
        ].map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
            }}
          />
        ))}
      </div>

      {/* ── Page content ─────────────────────────────────────────── */}
      <div className="relative z-10 pb-32">
        {/* Safe area inset */}
        <div style={{ height: 'env(safe-area-inset-top, 0px)' }} />
        <TrainingContentClient userSite={user.site} />
      </div>
    </div>
  )
}
