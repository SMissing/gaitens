'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { GraduationCap, Calendar, Compass, ArrowRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const ONBOARDING_KEY = 'onboarding_v1_complete'

interface Step {
  icon: React.ReactNode
  title: string
  body: string
}

const STEPS: Step[] = [
  {
    icon: <Compass className="h-8 w-8 text-spirits-cyan" />,
    title: 'Welcome to your portal',
    body: 'Everything you need is here — notices, time off, training, and more. The dock at the bottom is how you get around.',
  },
  {
    icon: <GraduationCap className="h-8 w-8 text-amber-300" />,
    title: 'Start with your training',
    body: "When you're ready, open the Training section (second icon in the dock). Complete your required modules to earn XP and badges.",
  },
  {
    icon: <Calendar className="h-8 w-8 text-green-400" />,
    title: 'Book time off anytime',
    body: "Use the Time Off section to request holidays. You'll see your approved days and pending requests right on your dashboard.",
  },
]

export function FirstLoginOnboarding() {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem(ONBOARDING_KEY)) return
    // Short delay so the dashboard content loads first
    const t = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(t)
  }, [])

  const dismiss = () => {
    setVisible(false)
    localStorage.setItem(ONBOARDING_KEY, '1')
  }

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      dismiss()
    }
  }

  const current = STEPS[step]

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-sm"
            onClick={dismiss}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.45 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[201] mx-auto max-w-sm"
          >
            <div className="relative rounded-2xl border border-border/50 bg-[#1a1a1a] shadow-2xl overflow-hidden">
              {/* Dismiss */}
              <button
                onClick={dismiss}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Skip onboarding"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Step content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.22 }}
                  className="p-6 pt-5"
                >
                  <div className="mb-4">{current.icon}</div>
                  <h2 className="text-base font-bold text-foreground mb-2">{current.title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{current.body}</p>
                </motion.div>
              </AnimatePresence>

              {/* Footer */}
              <div className="px-6 pb-5 flex items-center justify-between gap-4">
                {/* Step dots */}
                <div className="flex gap-1.5">
                  {STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === step ? 'w-5 bg-spirits-cyan' : 'w-1.5 bg-white/20'
                      }`}
                    />
                  ))}
                </div>

                <Button
                  onClick={next}
                  size="sm"
                  className="flex items-center gap-1.5 rounded-xl"
                >
                  {step < STEPS.length - 1 ? (
                    <>Next <ArrowRight className="h-3.5 w-3.5" /></>
                  ) : (
                    "Let's go"
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
