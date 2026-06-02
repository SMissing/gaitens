'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Lock, Play, BookOpen, FileText, Clock } from 'lucide-react'
import type { TrainingCourse } from '@/types/database'
import { cn } from '@/lib/utils'
import { hasResumeState } from '@/lib/training-xp'

interface TrainingCourseWithStatus extends TrainingCourse {
  completed: boolean
  required: boolean
  completion?: { completedAt: string; expiresAt: string }
}

interface TrainingPathProps {
  courses: TrainingCourseWithStatus[]
  onStartCourse: (courseId: string) => void
  userSite: string | null
}

// Per-unit gradient themes (from → to)
const UNIT_THEMES = [
  { from: '#3B82F6', to: '#1D4ED8' },
  { from: '#8B5CF6', to: '#6D28D9' },
  { from: '#EC4899', to: '#BE185D' },
  { from: '#10B981', to: '#047857' },
  { from: '#F59E0B', to: '#B45309' },
  { from: '#F97316', to: '#C2410C' },
  { from: '#EF4444', to: '#B91C1C' },
  { from: '#6366F1', to: '#4338CA' },
  { from: '#14B8A6', to: '#0F766E' },
  { from: '#06B6D4', to: '#0E7490' },
]

// Zigzag horizontal offsets — creates the Duolingo winding path feel
const ZIGZAG = [
  'translate-x-0',
  'translate-x-8 sm:translate-x-14',
  'translate-x-14 sm:translate-x-20',
  'translate-x-8 sm:translate-x-14',
  'translate-x-0',
  '-translate-x-8 sm:-translate-x-14',
  '-translate-x-14 sm:-translate-x-20',
  '-translate-x-8 sm:-translate-x-14',
]

// Category → emoji lookup
const EMOJI_MAP: [string[], string][] = [
  [['bar', 'drink', 'cocktail', 'alcohol', 'beer'], '🍺'],
  [['kitchen', 'food', 'cook', 'chef'], '🍳'],
  [['golf', 'swing', 'sport'], '⛳'],
  [['safety', 'fire', 'health', 'first aid', 'emergency'], '🛡️'],
  [['service', 'customer', 'guest', 'hospitality'], '🤝'],
  [['hygiene', 'clean', 'wash', 'sanit'], '🧼'],
  [['coffee', 'cafe', 'barista'], '☕'],
  [['wine', 'cellar', 'sommelier'], '🍷'],
  [['team', 'staff', 'people', 'hr'], '👥'],
  [['management', 'manager', 'lead', 'admin'], '📋'],
  [['tech', 'system', 'pos', 'till'], '💻'],
  [['opening', 'closing', 'checklist'], '✅'],
  [['music', 'entertainment', 'event'], '🎵'],
  [['garden', 'outdoor', 'terrace'], '🌿'],
]

function getCategoryEmoji(name: string): string {
  const lower = name.toLowerCase()
  for (const [keywords, emoji] of EMOJI_MAP) {
    if (keywords.some(k => lower.includes(k))) return emoji
  }
  return '📚'
}

function getModuleIcon(type: string) {
  if (type === 'video') return <Play className="h-6 w-6" />
  if (type === 'guide') return <BookOpen className="h-6 w-6" />
  return <FileText className="h-6 w-6" />
}

export function TrainingPath({ courses, onStartCourse }: TrainingPathProps) {
  // Resume IDs must be computed client-side only — localStorage is unavailable on the
  // server, so calling hasResumeState() during render causes a hydration mismatch.
  const [resumeIds, setResumeIds] = useState<Set<string>>(new Set())
  useEffect(() => {
    setResumeIds(new Set(
      courses.filter(c => !c.completed && hasResumeState(c.id)).map(c => c.id)
    ))
  }, [courses])

  const categoriesMap = courses.reduce((acc, course) => {
    const cat = course.category || 'General'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(course)
    return acc
  }, {} as Record<string, TrainingCourseWithStatus[]>)

  const categories = Object.entries(categoriesMap).map(([name, catCourses]) => {
    const sorted = [...catCourses].sort((a, b) => {
      if (a.required && !b.required) return -1
      if (!a.required && b.required) return 1
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })
    const completedCount = sorted.filter(c => c.completed).length
    const totalRequired = sorted.filter(c => c.required).length
    const completedRequired = sorted.filter(c => c.required && c.completed).length
    const firstIncompleteIdx = sorted.findIndex(c => !c.completed)
    return {
      name,
      courses: sorted,
      completedCount,
      total: sorted.length,
      totalRequired,
      completedRequired,
      remaining: sorted.length - completedCount,
      isComplete: completedCount === sorted.length,
      hasRequiredIncomplete: totalRequired > 0 && completedRequired < totalRequired,
      firstIncompleteIdx,
    }
  })

  categories.sort((a, b) => {
    if (a.hasRequiredIncomplete && !b.hasRequiredIncomplete) return -1
    if (!a.hasRequiredIncomplete && b.hasRequiredIncomplete) return 1
    if (!a.isComplete && b.isComplete) return -1
    if (a.isComplete && !b.isComplete) return 1
    return a.name.localeCompare(b.name)
  })

  const upNextCategoryName = categories.find(c => !c.isComplete)?.name

  if (courses.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🎓</div>
        <p className="text-muted-foreground">No training modules available yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-0 pb-20">
      {categories.map((category, catIdx) => {
        const theme = UNIT_THEMES[catIdx % UNIT_THEMES.length]
        const emoji = getCategoryEmoji(category.name)
        const isUpNext = category.name === upNextCategoryName
        const progress = category.total > 0 ? (category.completedCount / category.total) * 100 : 0
        const globalNextCourseId =
          isUpNext && category.firstIncompleteIdx >= 0
            ? category.courses[category.firstIncompleteIdx].id
            : null

        return (
          <div key={category.name}>
            {/* ── Unit banner ─────────────────────────────────────── */}
            <div
              className="rounded-2xl p-5 mb-8 relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}
            >
              {/* Watermark emoji */}
              <div className="absolute -right-3 -top-3 text-[96px] opacity-[0.12] select-none pointer-events-none leading-none">
                {emoji}
              </div>

              <div className="relative">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl leading-none">{emoji}</span>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-0.5">
                        Unit {catIdx + 1}
                      </p>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                        {category.name}
                      </h2>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0 pt-0.5">
                    {category.isComplete ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-white bg-white/20 rounded-full px-2.5 py-1">
                        <CheckCircle className="h-3 w-3" /> Complete
                      </span>
                    ) : isUpNext ? (
                      <span className="text-[11px] font-black text-white bg-white/25 rounded-full px-3 py-1 uppercase tracking-wide animate-pulse">
                        Up Next
                      </span>
                    ) : null}
                    {category.hasRequiredIncomplete && (
                      <span className="text-[10px] font-bold text-amber-200 bg-black/20 rounded-full px-2 py-0.5">
                        ⚡ Required
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2.5 bg-black/30 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${progress}%`, background: 'rgba(255,255,255,0.55)' }}
                  />
                </div>
                <div className="flex justify-between items-center mt-1.5">
                  <span className="text-xs text-white/65">
                    {category.completedCount}/{category.total} complete
                  </span>
                  {category.remaining > 0 && (
                    <span className="text-xs font-bold text-white/90">
                      {category.remaining} left
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ── Course nodes (zigzag path) ───────────────────────── */}
            <div className="flex flex-col items-center">
              {category.courses.map((course, courseIdx) => {
                const isCompleted = course.completed
                const isLocked =
                  category.firstIncompleteIdx !== -1 && courseIdx > category.firstIncompleteIdx
                const isNext = course.id === globalNextCourseId
                const hasResume = !isCompleted && !isLocked && resumeIds.has(course.id)
                const isLast = courseIdx === category.courses.length - 1
                const zigzag = ZIGZAG[courseIdx % ZIGZAG.length]

                return (
                  <div key={course.id} className="flex flex-col items-center w-full">
                    {/* Node + label (offset horizontally for zigzag) */}
                    <div className={cn('flex flex-col items-center transition-transform duration-300', zigzag)}>
                      {/* Circle node */}
                      <button
                        disabled={isLocked}
                        onClick={() => !isLocked && onStartCourse(course.id)}
                        className={cn(
                          'relative rounded-full flex items-center justify-center text-white',
                          'transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/30',
                          isNext ? 'w-20 h-20 sm:w-24 sm:h-24' : 'w-16 h-16 sm:w-18 sm:h-18',
                          isLocked && 'cursor-not-allowed',
                          !isLocked && 'active:scale-95',
                        )}
                        style={
                          isLocked
                            ? {
                                background: 'linear-gradient(135deg, #374151, #1f2937)',
                                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
                                outline: '2px dashed rgba(255,255,255,0.1)',
                                outlineOffset: '2px',
                              }
                            : isCompleted
                            ? { background: 'linear-gradient(135deg, #10B981, #047857)', boxShadow: '0 4px 20px rgba(16,185,129,0.4)' }
                            : isNext
                            ? { background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`, boxShadow: `0 8px 32px ${theme.from}55` }
                            : { background: `linear-gradient(135deg, ${theme.from}bb, ${theme.to}bb)`, boxShadow: `0 2px 12px ${theme.from}33` }
                        }
                      >
                        {/* Animated ring on "next" node */}
                        {isNext && (
                          <>
                            <div
                              className="absolute inset-0 rounded-full animate-ping opacity-30"
                              style={{ background: theme.from }}
                            />
                            <div
                              className="absolute -inset-2.5 rounded-full border-4 animate-pulse opacity-40"
                              style={{ borderColor: theme.from }}
                            />
                          </>
                        )}
                        {/* Green ring on completed */}
                        {isCompleted && (
                          <div className="absolute -inset-1.5 rounded-full border-4 border-green-400/30" />
                        )}

                        <div className={cn('relative z-10', isNext && 'scale-125')}>
                          {isCompleted
                            ? <CheckCircle className="h-7 w-7 sm:h-8 sm:w-8" />
                            : isLocked
                            ? <Lock className="h-5 w-5 text-gray-500" />
                            : getModuleIcon(course.moduleType)}
                        </div>
                      </button>

                      {/* Node label */}
                      <div className="mt-3 text-center w-28 sm:w-40">
                        <p className={cn(
                          'text-xs leading-snug',
                          isNext ? 'font-bold text-sm text-foreground' : 'font-medium',
                          isLocked ? 'text-muted-foreground/50' : 'text-muted-foreground',
                        )}>
                          {course.title}
                        </p>
                        {/* F-09: locked nodes show a clear reason, not just opacity */}
                        {isLocked ? (
                          <p className="text-[10px] text-muted-foreground/35 mt-0.5">
                            Complete previous to unlock
                          </p>
                        ) : (
                          <div className="flex items-center justify-center gap-2 mt-1 flex-wrap">
                            {course.required && (
                              <span className="text-[10px] text-yellow-500 font-bold">Required</span>
                            )}
                            {course.duration && (
                              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                                <Clock className="h-2.5 w-2.5" />{course.duration}m
                              </span>
                            )}
                            {hasResume && (
                              <span className="text-[10px] text-primary font-bold">Resume</span>
                            )}
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Spacer between nodes */}
                    {!isLast && <div className="h-5" />}
                  </div>
                )
              })}
            </div>

            {/* Divider + trophy between sections */}
            {catIdx < categories.length - 1 && (
              <div className="flex flex-col items-center gap-3 my-10">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
                <div className="flex items-center gap-3">
                  <div className="h-px w-12 bg-border/30" />
                  <span className="text-2xl">🏆</span>
                  <div className="h-px w-12 bg-border/30" />
                </div>
                <p className="text-xs text-muted-foreground font-medium">Next Unit</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
