import Image from 'next/image'
import { requireManager } from '@/lib/auth'
import { TrainingManagement } from '@/components/training/TrainingManagement'

export default async function TrainingManagementPage() {
  await requireManager()

  return (
    <div className="min-h-screen relative" style={{ background: '#0c0c1e' }}>

      {/* Gradient hero backdrop — amber/deep-orange tint to distinguish from staff training */}
      <div
        className="absolute inset-x-0 top-0 h-96 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, #2d1200 0%, #180900 35%, #0c0c1e 100%)',
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
        {[
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

      {/* Page content */}
      <div className="relative z-10 pb-32">
        <div style={{ height: 'env(safe-area-inset-top, 0px)' }} />
        <TrainingManagement />
      </div>
    </div>
  )
}
