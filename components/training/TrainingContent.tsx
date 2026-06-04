'use client'

import { useState, useEffect, useMemo } from 'react'
import { Flame, Star, MapPin, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import type { TrainingCourse, QuizQuestion } from '@/types/database'
import { TrainingPath } from './TrainingPath'
import { CoursePage } from './CoursePage'
import { PracticeSession } from './PracticeSession'
import { getStreak, calculateCourseXP, PRACTICE_XP } from '@/lib/training-xp'

interface TrainingCourseWithStatus extends TrainingCourse {
  completed: boolean
  required: boolean
  completion?: { completedAt: string; expiresAt: string }
}

interface TrainingContentProps {
  courses: TrainingCourseWithStatus[]
  userSite: string | null
  selectedBusiness?: string | null
  onRefresh?: () => void
}

export function TrainingContent({ courses, userSite, onRefresh }: TrainingContentProps) {
  const [currentCourseId, setCurrentCourseId] = useState<string | null>(null)
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set())
  const [practiceOpen, setPracticeOpen] = useState(false)

  // Streak — still localStorage (day-based, less critical)
  const [streak, setStreak] = useState(0)

  // XP — derived from completed courses (database-backed, persists across sessions)
  const xp = useMemo(
    () => courses.filter(c => c.completed).reduce((sum, c) => sum + calculateCourseXP(c.duration), 0),
    [courses],
  )

  // F-07: first-use onboarding hint
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    setStreak(getStreak())
  }, [])

  useEffect(() => {
    setCompletedModules(new Set(courses.filter(c => c.completed).map(c => c.id)))
  }, [courses])

  // F-07: show once, 1.8 s after path renders, only if never dismissed
  useEffect(() => {
    if (typeof window === 'undefined' || courses.length === 0) return
    if (!localStorage.getItem('gl_training_onboarded')) {
      const t = setTimeout(() => setShowHint(true), 1800)
      return () => clearTimeout(t)
    }
  }, [courses.length])

  const dismissHint = () => {
    setShowHint(false)
    if (typeof window !== 'undefined') localStorage.setItem('gl_training_onboarded', '1')
  }

  // Practice — sample up to 10 questions from completed quiz modules (stable across re-renders)
  const practiceQuestions = useMemo(() => {
    const pool = courses
      .filter(c => c.completed && Array.isArray((c as any).quizQuestions) && (c as any).quizQuestions.length > 0)
      .flatMap(c => (c as any).quizQuestions as QuizQuestion[])
    if (pool.length === 0) return []
    // Deterministic shuffle seeded by today's date so questions change daily
    const seed = new Date().toDateString()
    const sorted = [...pool].sort((a, b) =>
      (a.question + seed).localeCompare(b.question + seed),
    )
    return sorted.slice(0, 10)
  }, [courses])

  const requiredCourses = courses.filter(c => c.required)
  const totalRequired = requiredCourses.length
  const completedRequired = requiredCourses.filter(c => completedModules.has(c.id)).length
  const progressPct = totalRequired > 0 ? (completedRequired / totalRequired) * 100 : 0
  const allDone = totalRequired > 0 && progressPct === 100

  const handleCourseComplete = () => {
    if (currentCourseId) setCompletedModules(prev => new Set([...prev, currentCourseId]))
    setCurrentCourseId(null)
    setStreak(getStreak())
    if (onRefresh) setTimeout(() => onRefresh(), 100)
  }

  const handlePracticeComplete = (earnedXP: number) => {
    setPracticeOpen(false)
    setStreak(getStreak())
    // Refresh so XP and streak chips update
    if (onRefresh) setTimeout(() => onRefresh(), 100)
  }

  // Practice session — full-screen portal, rendered at body level
  if (practiceOpen && practiceQuestions.length > 0) {
    return (
      <PracticeSession
        questions={practiceQuestions}
        existingXP={xp}
        onComplete={handlePracticeComplete}
        onBack={() => setPracticeOpen(false)}
      />
    )
  }

  // Lesson view — CoursePage handles its own full-screen portal
  if (currentCourseId) {
    const currentCourse = courses.find(c => c.id === currentCourseId)
    if (!currentCourse) { setCurrentCourseId(null); return null }
    return (
      <CoursePage
        course={currentCourse}
        onComplete={handleCourseComplete}
        onBack={() => setCurrentCourseId(null)}
        existingXP={xp}
      />
    )
  }

  return (
    <div>
      {/* ── Hero header — sits on the page gradient ──────────────── */}
      <div className="px-5 pt-6 pb-10">

        {/* Top row: branding + stat chips */}
        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35 mb-1">
              Gaitens Leisure
            </p>
            <h1 className="text-4xl font-black text-white leading-none tracking-tight">
              Training
              <br />
              <span className="text-white/90">Hub</span>
            </h1>
          </div>

          {/* Gamification chips */}
          <div className="flex flex-col items-end gap-2 pt-1 flex-shrink-0">
            {streak > 0 && (
              <div className="flex items-center gap-1.5 bg-orange-500/20 text-orange-300 rounded-2xl px-3 py-1.5 border border-orange-500/20">
                <Flame className="h-4 w-4" />
                <span className="font-black text-sm tabular-nums">{streak}</span>
                <span className="text-xs text-orange-300/70 font-medium">day streak</span>
              </div>
            )}
            {xp > 0 && (
              <div className="flex items-center gap-1.5 bg-yellow-500/15 text-yellow-300 rounded-2xl px-3 py-1.5 border border-yellow-500/20">
                <Star className="h-3.5 w-3.5 fill-yellow-300" />
                <span className="font-black text-sm tabular-nums">{xp.toLocaleString()}</span>
                <span className="text-xs text-yellow-300/60 font-medium">XP</span>
              </div>
            )}
            {practiceQuestions.length >= 3 && (
              <button
                onClick={() => setPracticeOpen(true)}
                className="flex items-center gap-1.5 bg-amber-500/15 text-amber-300 rounded-2xl px-3 py-1.5 border border-amber-500/20 hover:bg-amber-500/25 transition-colors"
              >
                <Zap className="h-3.5 w-3.5" />
                <span className="text-xs text-amber-300/70 font-medium">Practice</span>
              </button>
            )}
          </div>
        </div>

        {/* Venue chip */}
        {userSite && (
          <div className="flex items-center gap-1.5 mb-5">
            <MapPin className="h-3.5 w-3.5 text-white/35" />
            <span className="text-sm text-white/55 font-medium">{userSite}</span>
          </div>
        )}

        {/* Progress — only if required modules exist */}
        {totalRequired > 0 && (
          <div className="space-y-2">
            {/* Bar */}
            <div className="h-4 bg-white/10 rounded-full overflow-hidden border border-white/5">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: allDone
                    ? 'linear-gradient(90deg, #10B981, #059669)'
                    : 'linear-gradient(90deg, #f59e0b, #f97316)',
                }}
                initial={{ width: '0%' }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              />
            </div>

            {/* Labels */}
            <div className="flex justify-between items-center">
              <span className="text-xs text-white/45 font-medium">
                {completedRequired} of {totalRequired} required
              </span>
              <span className={`text-xs font-black tabular-nums ${allDone ? 'text-green-400' : 'text-white/60'}`}>
                {Math.round(progressPct)}%
              </span>
            </div>
          </div>
        )}

        {/* All-done celebration */}
        {allDone && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="mt-5 rounded-2xl px-4 py-3.5 flex items-center gap-3 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.25), rgba(5,150,105,0.15))', border: '1px solid rgba(16,185,129,0.3)' }}
          >
            <span className="text-2xl leading-none flex-shrink-0">🎉</span>
            <div>
              <p className="text-sm font-black text-green-300">All required training complete!</p>
              {userSite && (
                <p className="text-xs text-green-400/60 mt-0.5">You&apos;re fully up to date for {userSite}</p>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* F-07: First-use hint — shown once, disappears after tap */}
      <AnimatePresence>
        {showHint && (
          <motion.button
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            onClick={dismissHint}
            className="mx-5 mb-4 w-[calc(100%-2.5rem)] text-left rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3.5 flex items-center gap-3 active:bg-white/10 transition-colors"
          >
            <span className="text-2xl leading-none">👆</span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white">Tap a glowing module to begin</p>
              <p className="text-xs text-white/40">Tap anywhere on this card to dismiss</p>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Path — renders below the hero on the dark background ─── */}
      <div className="px-4">
        <TrainingPath
          courses={courses}
          onStartCourse={setCurrentCourseId}
          userSite={userSite}
        />
      </div>

      {/* ── Practice button — shown when there are completed quiz modules ── */}
      {practiceQuestions.length >= 3 && (
        <div className="px-4 pt-4 pb-8">
          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Practice</span>
            <div className="h-px flex-1 bg-gradient-to-r from-white/15 via-white/15 to-transparent" />
          </div>

          <button
            onClick={() => setPracticeOpen(true)}
            className="w-full group"
          >
            <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5">
              {/* Glow */}
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)' }} />

              <div className="relative flex items-center gap-4 px-5 py-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-amber-400" />
                </div>

                <div className="flex-1 text-left min-w-0">
                  <p className="text-base font-black text-white leading-tight">Practice</p>
                  <p className="text-xs text-white/45 mt-0.5">
                    {practiceQuestions.length} questions · keeps your streak going
                  </p>
                </div>

                <div className="flex-shrink-0 flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1 bg-yellow-500/15 text-yellow-400 rounded-full px-2 py-0.5 border border-yellow-500/20">
                    <Star className="h-2.5 w-2.5 fill-yellow-400" />
                    <span className="text-[10px] font-black">+{PRACTICE_XP} XP</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400/50 group-hover:text-amber-400 transition-colors group-hover:translate-x-0.5 transition-transform">
                    <span className="text-[10px] font-bold">Start</span>
                    <span className="text-sm">→</span>
                  </div>
                </div>
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}
