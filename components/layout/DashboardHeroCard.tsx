'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { GraduationCap, Calendar, Award, ArrowRight } from 'lucide-react'

interface DashboardHeroCardProps {
  userName: string
  upcomingHolidayCount: number
  pendingHolidayCount: number
}

interface HeroSlide {
  key: string
  icon: React.ReactNode
  headline: string
  sub: string
  href: string
  gradient: string
}

export function DashboardHeroCard({
  userName,
  upcomingHolidayCount,
  pendingHolidayCount,
}: DashboardHeroCardProps) {
  const [idx, setIdx] = useState(0)
  const [trainingPct, setTrainingPct] = useState<number | null>(null)
  const [trainingLabel, setTrainingLabel] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/training')
      .then(r => r.ok ? r.json() : null)
      .then((data: unknown) => {
        if (!Array.isArray(data)) return
        const courses = data as { completed: boolean; required: boolean }[]
        const required = courses.filter(c => c.required)
        if (required.length > 0) {
          const done = required.filter(c => c.completed).length
          setTrainingPct(Math.round((done / required.length) * 100))
          setTrainingLabel(`${done} of ${required.length} required modules`)
        } else if (courses.length > 0) {
          const done = courses.filter(c => c.completed).length
          setTrainingPct(Math.round((done / courses.length) * 100))
          setTrainingLabel(`${done} of ${courses.length} modules`)
        }
      })
      .catch(() => {})
  }, [])

  const slides: HeroSlide[] = []

  if (trainingPct !== null && trainingPct < 100) {
    slides.push({
      key: 'training',
      icon: <GraduationCap className="h-6 w-6 text-amber-300" />,
      headline: `${trainingPct}% trained`,
      sub: trainingLabel ?? 'Keep going',
      href: '/training',
      gradient: 'linear-gradient(135deg, #1e0a5e 0%, #0d1b52 60%, #0c0c1e 100%)',
    })
  }

  if (upcomingHolidayCount > 0) {
    slides.push({
      key: 'holidays',
      icon: <Calendar className="h-6 w-6 text-green-400" />,
      headline: `${upcomingHolidayCount} approved ${upcomingHolidayCount === 1 ? 'day' : 'days'} off coming up`,
      sub: 'Your next break is scheduled',
      href: '/holidays/upcoming',
      gradient: 'linear-gradient(135deg, #0a2e1a 0%, #0d2d1e 60%, #0a1e14 100%)',
    })
  }

  if (pendingHolidayCount > 0) {
    slides.push({
      key: 'pending',
      icon: <Calendar className="h-6 w-6 text-amber-400" />,
      headline: `${pendingHolidayCount} holiday ${pendingHolidayCount === 1 ? 'request' : 'requests'} pending`,
      sub: 'Awaiting manager approval',
      href: '/holidays',
      gradient: 'linear-gradient(135deg, #2e1a00 0%, #2a1800 60%, #1a1000 100%)',
    })
  }

  // Fallback slide
  if (slides.length === 0) {
    slides.push({
      key: 'welcome',
      icon: <Award className="h-6 w-6 text-spirits-cyan" />,
      headline: `Welcome back, ${userName.split(' ')[0]}`,
      sub: 'Your portal is up to date',
      href: '/dashboard',
      gradient: 'linear-gradient(135deg, #0a1e2e 0%, #0d1b2a 60%, #0a1420 100%)',
    })
  }

  useEffect(() => {
    if (slides.length <= 1) return
    const t = setInterval(() => setIdx(i => (i + 1) % slides.length), 5000)
    return () => clearInterval(t)
  }, [slides.length])

  const slide = slides[idx % slides.length]

  return (
    <div className="mb-4 sm:mb-6">
      <Link href={slide.href} className="block group focus:outline-none">
        <div
          className="relative overflow-hidden rounded-2xl px-5 py-4 flex items-center gap-4"
          style={{ background: slide.gradient, minHeight: 72 }}
        >
          {/* Ring inset */}
          <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 pointer-events-none" />

          <AnimatePresence mode="wait">
            <motion.div
              key={slide.key}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-4 min-w-0 flex-1"
            >
              <div className="flex-shrink-0">{slide.icon}</div>
              <div className="min-w-0">
                <p className="text-sm font-black text-white/90 truncate leading-tight">{slide.headline}</p>
                <p className="text-xs text-white/45 mt-0.5 truncate">{slide.sub}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          <ArrowRight className="h-4 w-4 text-white/25 group-hover:text-white/60 transition-colors flex-shrink-0" />

          {/* Slide dots */}
          {slides.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {slides.map((s, i) => (
                <div
                  key={s.key}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === idx % slides.length ? 'w-4 bg-white/60' : 'w-1 bg-white/20'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}
