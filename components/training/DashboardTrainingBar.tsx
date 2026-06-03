'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { Star, Flame, ArrowRight, Play, FileText, BookOpen, GraduationCap } from 'lucide-react'
import { calculateCourseXP, getStreak } from '@/lib/training-xp'

interface CourseItem {
  id: string
  title: string
  completed: boolean
  required: boolean
  duration: number | null
  moduleType: string
  category: string | null
}

const STARS = [
  { top: '10%', left: '12%',  size: 2,   opacity: 0.35 },
  { top: '6%',  left: '38%',  size: 1,   opacity: 0.25 },
  { top: '18%', left: '58%',  size: 1.5, opacity: 0.2  },
  { top: '8%',  left: '78%',  size: 2,   opacity: 0.3  },
  { top: '32%', left: '90%',  size: 1,   opacity: 0.2  },
  { top: '55%', left: '82%',  size: 1.5, opacity: 0.15 },
  { top: '70%', left: '65%',  size: 1,   opacity: 0.2  },
  { top: '60%', left: '22%',  size: 1,   opacity: 0.15 },
  { top: '80%', left: '45%',  size: 1.5, opacity: 0.12 },
  { top: '25%', left: '5%',   size: 1,   opacity: 0.2  },
]

function ModuleIcon({ type }: { type: string }) {
  if (type === 'video') return <Play  className="h-3.5 w-3.5" />
  if (type === 'guide') return <BookOpen className="h-3.5 w-3.5" />
  return <FileText className="h-3.5 w-3.5" />
}

export function DashboardTrainingBar() {
  const [courses, setCourses] = useState<CourseItem[] | null>(null)
  const [streak, setStreak]   = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setStreak(getStreak())
    fetch('/api/training')
      .then(r => r.ok ? r.json() : null)
      .then((data: unknown) => {
        if (Array.isArray(data)) setCourses(data as CourseItem[])
      })
      .catch(() => {})
  }, [])

  const stats = useMemo(() => {
    if (!courses) return null

    const total             = courses.length
    const completed         = courses.filter(c => c.completed).length
    const requiredAll       = courses.filter(c => c.required)
    const totalRequired     = requiredAll.length
    const completedRequired = requiredAll.filter(c => c.completed).length
    const xp                = courses
      .filter(c => c.completed)
      .reduce((sum, c) => sum + calculateCourseXP(c.duration), 0)

    const next = requiredAll.find(c => !c.completed)
      ?? courses.find(c => !c.completed)
      ?? null

    return { total, completed, totalRequired, completedRequired, xp, next }
  }, [courses])

  // Skeleton
  if (!mounted || courses === null) {
    return (
      <div
        className="mb-4 sm:mb-6 rounded-2xl overflow-hidden animate-pulse"
        style={{ background: 'linear-gradient(160deg, #1e0a5e 0%, #0d1b52 55%, #0c0c1e 100%)' }}
      >
        <div className="px-4 pt-4 pb-4 space-y-3">
          <div className="flex justify-between items-center">
            <div className="h-3.5 w-24 bg-white/15 rounded-full" />
            <div className="h-5 w-20 bg-white/10 rounded-full" />
          </div>
          <div className="h-3 w-full bg-white/[0.1] rounded-full" />
          <div className="h-14 w-full bg-white/[0.06] rounded-xl" />
        </div>
      </div>
    )
  }

  if (!stats || stats.total === 0) return null
  if (stats.completed >= stats.total)  return null

  const showRequired  = stats.totalRequired > 0
  const progressPct   = showRequired
    ? (stats.completedRequired / stats.totalRequired) * 100
    : (stats.completed / stats.total) * 100

  const progressLabel = showRequired
    ? `${stats.completedRequired} of ${stats.totalRequired} required`
    : `${stats.completed} of ${stats.total} modules`

  const tagline = stats.next?.required
    ? 'You have required training to complete'
    : stats.totalRequired > 0
    ? 'Required complete — keep going'
    : 'Continue building your skills'

  return (
    <div className="mb-4 sm:mb-6">
      <Link href="/training" className="block group focus:outline-none">
        <motion.div
          className="relative overflow-hidden rounded-2xl"
          style={{ background: 'linear-gradient(160deg, #1e0a5e 0%, #0d1b52 55%, #0c0c1e 100%)' }}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.18 }}
        >
          {/* Star particles */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            {STARS.map((s, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white"
                style={{ top: s.top, left: s.left, width: s.size, height: s.size, opacity: s.opacity }}
              />
            ))}
          </div>

          {/* Subtle inner ring */}
          <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 pointer-events-none" />

          {/* ── Header ──────────────────────────────────────────── */}
          <div className="relative flex items-center justify-between px-4 pt-4 pb-2">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-white/60 flex-shrink-0" />
              <span className="text-sm font-black text-white/85 tracking-tight">Training Hub</span>
            </div>

            <div className="flex items-center gap-1.5">
              {stats.xp > 0 && (
                <div className="flex items-center gap-1 bg-yellow-500/20 text-yellow-300 rounded-full px-2.5 py-1 border border-yellow-400/25">
                  <Star className="h-3 w-3 fill-yellow-300 flex-shrink-0" />
                  <span className="text-xs font-black tabular-nums">{stats.xp.toLocaleString()} XP</span>
                </div>
              )}
              {streak > 0 && (
                <div className="flex items-center gap-1 bg-orange-500/20 text-orange-300 rounded-full px-2.5 py-1 border border-orange-400/25">
                  <Flame className="h-3 w-3 flex-shrink-0" />
                  <span className="text-xs font-black tabular-nums">{streak}</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Tagline ─────────────────────────────────────────── */}
          <p className="relative px-4 pb-2.5 text-xs text-white/40 font-medium">
            {tagline}
          </p>

          {/* ── Progress bar ────────────────────────────────────── */}
          <div className="relative px-4 pb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-white/40 font-medium">{progressLabel}</span>
              <span className="text-[11px] font-black text-white/55 tabular-nums">
                {Math.round(progressPct)}%
              </span>
            </div>
            <div className="h-3 bg-white/[0.1] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                style={{ background: 'linear-gradient(90deg, #f59e0b 0%, #f97316 100%)' }}
              />
            </div>
          </div>

          {/* ── Up next ─────────────────────────────────────────── */}
          {stats.next && (
            <div className="relative mx-3 mb-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 flex items-center gap-3">
              <div className="flex-shrink-0 text-amber-300/80">
                <ModuleIcon type={stats.next.moduleType} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-300/50 mb-0.5">
                  {stats.next.required ? 'Required · Up next' : 'Optional · Up next'}
                </p>
                <p className="text-sm font-bold text-white/90 truncate leading-tight">
                  {stats.next.title}
                </p>
              </div>

              <div className="flex-shrink-0 flex flex-col items-end gap-1">
                {stats.next.duration != null && (
                  <span className="text-[10px] text-white/30 tabular-nums">
                    {stats.next.duration} min
                  </span>
                )}
                <ArrowRight className="h-4 w-4 text-white/30 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all duration-200" />
              </div>
            </div>
          )}
        </motion.div>
      </Link>
    </div>
  )
}
