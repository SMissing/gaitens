import Image from 'next/image'
import Link from 'next/link'
import { requireManager } from '@/lib/auth'
import { ManagerStaffTrainingProgress } from '@/components/training/ManagerStaffTrainingProgress'
import { ArrowLeft } from 'lucide-react'

const STARS = [
  { top: '12%', left: '8%',  size: 2,   opacity: 0.4  },
  { top: '7%',  left: '22%', size: 1,   opacity: 0.3  },
  { top: '20%', left: '38%', size: 1.5, opacity: 0.25 },
  { top: '5%',  left: '55%', size: 2,   opacity: 0.35 },
  { top: '15%', left: '70%', size: 1,   opacity: 0.3  },
  { top: '28%', left: '82%', size: 2,   opacity: 0.2  },
  { top: '9%',  left: '91%', size: 1.5, opacity: 0.35 },
  { top: '33%', left: '15%', size: 1,   opacity: 0.2  },
  { top: '38%', left: '50%', size: 1.5, opacity: 0.15 },
  { top: '22%', left: '60%', size: 1,   opacity: 0.25 },
]

export default async function ManagerStaffTrainingPage() {
  await requireManager()

  return (
    <div className="min-h-screen relative" style={{ background: '#0c0c1e' }}>

      {/* Gradient hero backdrop — teal/cyan tint to distinguish from training hub (purple) and module maker (amber) */}
      <div
        className="absolute inset-x-0 top-0 h-96 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, #002d2d 0%, #001a1a 35%, #0c0c1e 100%)',
        }}
      />

      {/* Gaitens logo watermark */}
      <div
        className="absolute top-0 right-0 w-52 h-52 select-none pointer-events-none"
        style={{ opacity: 0.08 }}
        aria-hidden
      >
        <Image src="/logos/gaitens-logo-white.png" alt="" fill className="object-contain object-right-top" />
      </div>

      {/* Star field */}
      <div className="absolute inset-x-0 top-0 h-96 pointer-events-none overflow-hidden" aria-hidden>
        {STARS.map((star, i) => (
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

      {/* Page content */}
      <div className="relative z-10 pb-32">
        <div style={{ height: 'env(safe-area-inset-top, 0px)' }} />

        {/* Back nav */}
        <div className="px-4 pt-4 pb-0">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>

        <ManagerStaffTrainingProgress />
      </div>
    </div>
  )
}
