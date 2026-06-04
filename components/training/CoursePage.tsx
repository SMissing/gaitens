'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import {
  X, CheckCircle, XCircle, Loader2, Play,
  FileText, BookOpen, Star, Flame, ArrowRight, RotateCcw, Eye,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/utils'
import type { TrainingCourse, QuizQuestion } from '@/types/database'
import {
  hasResumeState, saveResumeState, clearResumeState,
  calculateCourseXP, updateStreak, getStreak, recordTrainingActivity,
} from '@/lib/training-xp'
import { SFX } from '@/lib/training-sfx'

interface CoursePageProps {
  course: TrainingCourse & {
    completed: boolean
    required: boolean
    completion?: { completedAt: string; expiresAt: string }
  }
  onComplete: () => void
  onBack: () => void
  existingXP?: number
}

type LessonStep = 'content' | 'choice' | 'quiz' | 'results' | 'review' | 'completed'

// ── Confetti ─────────────────────────────────────────────────────────────────
const CONFETTI = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  color: ['#ffd700','#ff6b6b','#4ecdc4','#45b7d1','#a29bfe','#fd79a8','#00b894'][i % 7],
  angle: (i / 20) * 360,
  dist: 160 + (i % 4) * 20,
  size: 6 + (i % 4) * 2,
}))

function ConfettiBurst() {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
      {CONFETTI.map(p => {
        const rad = (p.angle * Math.PI) / 180
        return (
          <motion.div
            key={p.id}
            className="absolute rounded-sm"
            style={{ width: p.size, height: p.size, background: p.color }}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
            animate={{ x: Math.cos(rad) * p.dist, y: Math.sin(rad) * p.dist + 50, opacity: 0, rotate: p.id * 20 }}
            transition={{ duration: 1 + (p.id % 4) * 0.1, ease: [0.16, 1, 0.3, 1], delay: (p.id % 5) * 0.04 }}
          />
        )
      })}
    </div>
  )
}

// ── Exit confirmation sheet ───────────────────────────────────────────────────
function ExitConfirmSheet({ isOpen, onConfirm, onCancel }: {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute inset-0 z-10 flex flex-col justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ background: 'rgba(0,0,0,0.65)' }}
          onClick={onCancel}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="rounded-t-3xl px-5 pb-10 pt-6 space-y-3"
            style={{ background: '#1a1a2e' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-black">Leave this lesson?</h3>
            <p className="text-sm text-muted-foreground pb-2">
              Your progress is saved — you can resume where you left off.
            </p>
            <button
              onClick={onCancel}
              className="w-full h-14 rounded-2xl text-white text-lg font-black shadow-[0_4px_0_rgba(0,0,0,0.4)] active:shadow-none active:translate-y-1 transition-all duration-150"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)' }}
            >
              Keep Learning
            </button>
            <button
              onClick={onConfirm}
              className="w-full h-12 rounded-2xl text-muted-foreground text-base font-semibold border border-border/30 hover:bg-accent/20 transition-colors"
            >
              Leave
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function paginateHTML(html: string | null | undefined): string[] {
  if (!html?.trim()) return []
  const parts = html.split(/(?=<h[23][\s>])/i)
  const pages = parts.filter(p => p.replace(/<[^>]+>/g, '').trim().length > 5)
  return pages.length ? pages : [html]
}

function getModuleColor(type: string): [string, string] {
  if (type === 'video') return ['#EF4444', '#DC2626']
  if (type === 'guide') return ['#8B5CF6', '#7C3AED']
  return ['#3B82F6', '#2563EB']
}

const OPTION_LABELS = ['A', 'B', 'C', 'D']

// ── Main component ────────────────────────────────────────────────────────────
export function CoursePage({ course, onComplete, onBack, existingXP = 0 }: CoursePageProps) {
  const questions    = (course.quizQuestions ?? []) as QuizQuestion[]
  const hasQuiz      = questions.length > 0
  const hasVideo     = !!(course.videoUrl && (course.moduleType === 'video' || course.moduleType === 'guide'))
  const textPages    = useMemo(() => paginateHTML(course.content), [course.content])
  const totalContent = (hasVideo ? 1 : 0) + textPages.length
  const [from, to]   = getModuleColor(course.moduleType)

  // ── Step & content paging ─────────────────────────────────────────────────
  const [step, setStep]               = useState<LessonStep>('content')
  const [contentPage, setContentPage] = useState(0)

  // ── Quiz state ────────────────────────────────────────────────────────────
  const [quizIdx, setQuizIdx]     = useState(0)
  const [answers, setAnswers]     = useState<(number | undefined)[]>(
    new Array(questions.length).fill(undefined),
  )
  const [quizPhase, setQuizPhase] = useState<'question' | 'checking'>('question')
  const [quizScore, setQuizScore] = useState(0)
  const [reviewMode, setReviewMode] = useState(false)

  // ── Celebration ───────────────────────────────────────────────────────────
  const [earnedXP, setEarnedXP] = useState(0)
  const [streak, setStreak]     = useState(0)
  const [totalXP, setTotalXP]   = useState(0)
  const [loading, setLoading]   = useState(false)
  const isMountedRef            = useRef(true)
  const [mounted, setMounted]   = useState(false)
  const [showExitSheet, setShowExitSheet] = useState(false)

  const isVideoPage = hasVideo && contentPage === 0
  const textIdx     = hasVideo ? contentPage - 1 : contentPage
  const isLastPage  = totalContent === 0 || contentPage >= totalContent - 1
  const currentQ    = questions[quizIdx]
  const currentAns  = answers[quizIdx]
  const isLastQ     = quizIdx === questions.length - 1

  const progressPct = useMemo(() => {
    if (step === 'completed') return 100
    if (step === 'quiz' || step === 'results' || step === 'review') return 100
    if (totalContent === 0) return 50
    return Math.round(((contentPage + 1) / totalContent) * 100)
  }, [step, contentPage, totalContent])

  useEffect(() => {
    setMounted(true)
    isMountedRef.current = true
    setStreak(getStreak())
    SFX.preloadAll() // fetch all sounds in parallel while user reads content
    if (hasResumeState(course.id) && hasQuiz) {
      setStep(totalContent > 0 ? 'choice' : 'quiz')
    }
    return () => { isMountedRef.current = false }
  }, [course.id, hasQuiz, totalContent])

  useEffect(() => {
    if (isLastPage && totalContent > 0 && hasQuiz) saveResumeState(course.id)
  }, [isLastPage, totalContent, course.id, hasQuiz])

  // ── Actions ───────────────────────────────────────────────────────────────
  const celebrate = () => {
    const xp          = calculateCourseXP(course.duration)
    const nxp         = existingXP + xp
    const localStreak = updateStreak()
    clearResumeState(course.id)
    setEarnedXP(xp); setTotalXP(nxp); setStreak(localStreak)
    setLoading(false); setStep('completed')
    SFX.complete()
    recordTrainingActivity().then(s => { if (isMountedRef.current) setStreak(s) }).catch(() => {})
  }

  const markComplete = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/training/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.id }),
      })
      if (res.ok && isMountedRef.current) celebrate()
      else {
        const err = await res.json().catch(() => ({}))
        alert(err.error || 'Failed to complete training. Please try again.')
        setLoading(false)
      }
    } catch {
      alert('Failed to complete training. Please try again.')
      setLoading(false)
    }
  }

  const completeWithScore = async (score: number) => {
    try {
      const res = await fetch('/api/training/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.id, score }),
      })
      if (res.ok) celebrate()
      else {
        const err = await res.json().catch(() => ({}))
        alert(err.error || 'Failed to complete training. Please try again.')
      }
    } catch {
      alert('Failed to complete training. Please try again.')
    }
  }

  const goNextContent = () => {
    if (!isLastPage) { setContentPage(p => p + 1) }
    else if (hasQuiz) { setStep('quiz') }
    else { markComplete() }
  }

  const handleCheck = () => {
    if (currentAns === undefined) return
    setQuizPhase('checking')
    if (currentAns === currentQ.correctAnswer) SFX.correct()
    else SFX.wrong()
  }
  const handleContinue = () => {
    if (isLastQ) {
      const correct = questions.reduce((n, q, i) => n + (answers[i] === q.correctAnswer ? 1 : 0), 0)
      setQuizScore(correct)
      setStep('results')
      if (correct === questions.length) SFX.victory()
      else SFX.fail()
    } else {
      setQuizIdx(i => i + 1)
      setQuizPhase('question')
    }
  }
  const handleRetry = () => {
    setQuizIdx(0)
    setAnswers(new Array(questions.length).fill(undefined))
    setQuizPhase('question')
    setQuizScore(0)
    setReviewMode(false)
    setStep('quiz')
  }

  const passed = quizScore === questions.length

  // ── Top bar (shared across content / quiz / review) ───────────────────────
  const TopBar = ({ progress = progressPct }: { progress?: number }) => (
    <div
      className="flex-shrink-0 flex items-center gap-3 px-4 pb-3"
      style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 1rem)' }}
    >
      <button
        onClick={() => setShowExitSheet(true)}
        className="w-9 h-9 flex items-center justify-center rounded-full text-muted-foreground hover:bg-accent/50 transition-colors flex-shrink-0"
        aria-label="Exit lesson"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="flex-1 h-3.5 bg-muted/60 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${from}, ${to})` }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      {streak > 0 && (
        <div className="flex items-center gap-1 text-orange-400 flex-shrink-0">
          <Flame className="h-4 w-4" />
          <span className="text-sm font-bold">{streak}</span>
        </div>
      )}
    </div>
  )

  if (!mounted) return null

  // ── CHOICE SCREEN ─────────────────────────────────────────────────────────
  if (step === 'choice') {
    return createPortal(
      <motion.div
        className="fixed inset-0 z-[200] flex flex-col"
        style={{ background: '#0f0f1a' }}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className="flex-shrink-0 px-4 pb-2"
          style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 1rem)' }}
        >
          <button
            onClick={() => setShowExitSheet(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full text-muted-foreground hover:bg-accent/50 transition-colors"
            aria-label="Back to training path"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-sm space-y-8 text-center">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                Resume lesson
              </p>
              <h2 className="text-2xl font-black leading-tight">{course.title}</h2>
              <p className="text-muted-foreground text-sm">
                You&apos;ve started this module before. What would you like to do?
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  clearResumeState(course.id)
                  setContentPage(0)
                  setStep('content')
                }}
                className="w-full h-14 rounded-2xl border border-border/50 font-bold text-base flex items-center justify-center gap-3 transition-colors hover:bg-accent/20 active:bg-accent/40"
              >
                {hasVideo ? <Play className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                {hasVideo ? 'Watch video again' : 'Read again'}
              </button>

              <button
                onClick={() => setStep('quiz')}
                className="w-full h-14 rounded-2xl text-white text-base font-black flex items-center justify-center gap-2 shadow-[0_4px_0_rgba(0,0,0,0.4)] active:shadow-none active:translate-y-1 transition-all duration-150"
                style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
              >
                Continue to Quiz
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <ExitConfirmSheet isOpen={showExitSheet} onConfirm={onBack} onCancel={() => setShowExitSheet(false)} />
      </motion.div>
    , document.body)
  }

  // ── COMPLETED SCREEN ──────────────────────────────────────────────────────
  if (step === 'completed') {
    return createPortal(
      <motion.div
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center px-6"
        style={{ background: '#0f0f1a' }}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      >
        <ConfettiBurst />
        <div className="relative z-10 text-center space-y-6 max-w-sm w-full">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.05 }}
            className="mx-auto w-28 h-28 rounded-full bg-green-500/15 flex items-center justify-center"
          >
            <CheckCircle className="h-16 w-16 text-green-500" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <h1 className="text-4xl font-black">Nailed it!</h1>
            <p className="text-muted-foreground mt-1">{course.title}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="flex items-center justify-center gap-3 flex-wrap"
          >
            <div className="flex items-center gap-2 bg-yellow-500/15 text-yellow-400 rounded-2xl px-6 py-3">
              <Star className="h-5 w-5 fill-yellow-400" />
              <span className="font-black text-xl">+{earnedXP} XP</span>
            </div>
            {streak > 0 && (
              <div className="flex items-center gap-2 bg-orange-500/15 text-orange-400 rounded-2xl px-6 py-3">
                <Flame className="h-5 w-5" />
                <span className="font-black text-xl">{streak} 🔥</span>
              </div>
            )}
          </motion.div>

          {totalXP > 0 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
              className="text-sm text-muted-foreground"
            >
              {totalXP.toLocaleString()} total XP
            </motion.p>
          )}

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <button
              onClick={onComplete}
              className="w-full h-14 rounded-2xl text-white text-lg font-black shadow-xl flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #10B981, #047857)' }}
            >
              Keep Going <ArrowRight className="h-5 w-5" />
            </button>
          </motion.div>
        </div>
      </motion.div>
    , document.body)
  }

  // ── REVIEW SCREEN ─────────────────────────────────────────────────────────
  if (step === 'review') {
    return createPortal(
      <motion.div
        className="fixed inset-0 z-[200] flex flex-col"
        style={{ background: '#0f0f1a' }}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      >
        <TopBar progress={100} />
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          <div>
            <h2 className="text-2xl font-black">Review your answers</h2>
            <p className="text-muted-foreground text-sm mt-1">Learn from what you missed, then try again.</p>
          </div>
          {questions.map((q, qi) => {
            const ua = answers[qi]
            return (
              <div key={qi} className="space-y-2">
                <p className="font-semibold text-sm">{qi + 1}. {q.question}</p>
                {q.options.map((opt, oi) => {
                  const isCorrect = oi === q.correctAnswer
                  const isUser    = oi === ua
                  return (
                    <div key={oi} className={cn(
                      'flex items-center gap-3 rounded-xl border px-4 py-3 text-sm',
                      isCorrect && 'border-green-500/60 bg-green-500/10 text-green-400',
                      isUser && !isCorrect && 'border-red-500/60 bg-red-500/10 text-red-400',
                      !isCorrect && !isUser && 'border-border/20 text-muted-foreground opacity-40',
                    )}>
                      {isCorrect
                        ? <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        : isUser ? <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                        : <div className="w-4 h-4 flex-shrink-0" />}
                      <span className="flex-1">{opt}</span>
                      {isCorrect && <span className="text-xs text-green-500 flex-shrink-0">Correct</span>}
                      {isUser && !isCorrect && <span className="text-xs text-red-500 flex-shrink-0">Your answer</span>}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
        <div className="flex-shrink-0 px-5 pb-10 pt-4 border-t border-border/10">
          <button
            onClick={handleRetry}
            className="w-full h-14 rounded-2xl text-white text-lg font-black flex items-center justify-center gap-2 shadow-[0_4px_0_rgba(0,0,0,0.4)] active:shadow-none active:translate-y-1 transition-all duration-150"
            style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
          >
            <RotateCcw className="h-5 w-5" /> Try Again
          </button>
        </div>

        <ExitConfirmSheet isOpen={showExitSheet} onConfirm={onBack} onCancel={() => setShowExitSheet(false)} />
      </motion.div>
    , document.body)
  }

  // ── RESULTS SCREEN ────────────────────────────────────────────────────────
  if (step === 'results') {
    return createPortal(
      <motion.div
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center px-6"
        style={{ background: '#0f0f1a' }}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="text-center space-y-6 max-w-sm w-full">
          <div className={cn(
            'mx-auto w-24 h-24 rounded-full flex items-center justify-center',
            passed ? 'bg-green-500/15' : 'bg-red-500/15',
          )}>
            {passed
              ? <CheckCircle className="h-14 w-14 text-green-500" />
              : <XCircle className="h-14 w-14 text-red-500" />}
          </div>

          <div>
            <h2 className="text-3xl font-black">{passed ? 'Perfect!' : 'Almost!'}</h2>
            <p className="text-muted-foreground mt-1">
              {quizScore}/{questions.length} correct
              {!passed && ' — you need all correct'}
            </p>
          </div>

          {passed ? (
            <button
              onClick={() => completeWithScore(quizScore)}
              className="w-full h-14 rounded-2xl text-white text-lg font-black flex items-center justify-center gap-2 shadow-[0_4px_0_rgba(0,0,0,0.4)] active:shadow-none active:translate-y-1 transition-all duration-150"
              style={{ background: 'linear-gradient(135deg, #10B981, #047857)' }}
            >
              <CheckCircle className="h-5 w-5" /> Complete
            </button>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => setStep('review')}
                className="w-full h-14 rounded-2xl text-white text-lg font-black flex items-center justify-center gap-2 shadow-[0_4px_0_rgba(0,0,0,0.4)] active:shadow-none active:translate-y-1 transition-all duration-150"
                style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
              >
                <Eye className="h-5 w-5" /> Review Answers
              </button>
              <button
                onClick={handleRetry}
                className="w-full h-14 rounded-2xl border border-border text-base font-bold flex items-center justify-center gap-2 transition-colors hover:bg-accent/20"
              >
                <RotateCcw className="h-5 w-5" /> Try Again
              </button>
            </div>
          )}
        </div>
      </motion.div>
    , document.body)
  }

  // ── QUIZ SCREEN ───────────────────────────────────────────────────────────
  if (step === 'quiz' && questions.length > 0) {
    const quizProgress = Math.round(((quizIdx + (quizPhase === 'checking' ? 1 : 0)) / questions.length) * 100)

    return createPortal(
      <motion.div
        className="fixed inset-0 z-[200] flex flex-col"
        style={{ background: '#0f0f1a' }}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      >
        <TopBar progress={quizProgress} />

        <div className="flex-shrink-0 px-5 pt-2 pb-1">
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wide">
            Question {quizIdx + 1} of {questions.length}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={quizIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <h2 className="text-xl sm:text-2xl font-bold leading-snug">{currentQ.question}</h2>

              <div className="space-y-3">
                {currentQ.options.map((opt, oi) => {
                  const isSelected = currentAns === oi
                  const isCorrect  = oi === currentQ.correctAnswer
                  const checking   = quizPhase === 'checking'

                  let border = 'border-border/60'
                  let bg     = 'bg-transparent'
                  let textCl = ''
                  if (!checking && isSelected)              { border = 'border-primary'; bg = 'bg-primary/30' }
                  if (checking && isCorrect)                { border = 'border-green-500'; bg = 'bg-green-500/15'; textCl = 'text-green-300' }
                  if (checking && isSelected && !isCorrect) { border = 'border-red-500';  bg = 'bg-red-500/15';   textCl = 'text-red-300' }

                  return (
                    <button
                      key={oi}
                      disabled={checking}
                      onClick={() => {
                        if (checking) return
                        const na = [...answers]; na[quizIdx] = oi; setAnswers(na)
                      }}
                      className={cn(
                        'w-full flex items-center gap-4 rounded-2xl border-2 px-4 py-4 text-left transition-all duration-150',
                        border, bg, textCl,
                        !checking && 'cursor-pointer shadow-[0_4px_0_rgba(0,0,0,0.3)] active:shadow-none active:translate-y-1',
                        checking && 'cursor-default',
                      )}
                    >
                      <div className={cn(
                        'w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 transition-colors',
                        !checking && isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                        checking && isCorrect && 'bg-green-500 text-white',
                        checking && isSelected && !isCorrect && 'bg-red-500 text-white',
                      )}>
                        {checking && isCorrect
                          ? <CheckCircle className="h-4 w-4" />
                          : checking && isSelected && !isCorrect
                          ? <XCircle className="h-4 w-4" />
                          : OPTION_LABELS[oi]}
                      </div>
                      <span className={cn('text-base font-medium leading-snug flex-1', isSelected && !checking && 'font-bold')}>
                        {opt}
                      </span>
                      <div className={cn(
                        'flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-150 flex items-center justify-center',
                        !checking && isSelected ? 'border-primary bg-primary' : 'border-border/40 bg-transparent',
                      )}>
                        {isSelected && !checking && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pinned action — fixed-height feedback container prevents button from jumping */}
        <div className={cn(
          'flex-shrink-0 px-5 pb-10 pt-4 border-t transition-colors duration-300',
          quizPhase === 'checking' && currentAns === currentQ.correctAnswer
            ? 'border-green-500/30 bg-green-500/5'
            : quizPhase === 'checking'
            ? 'border-red-500/30 bg-red-500/5'
            : 'border-border/10',
        )}>
          <div className="min-h-[1.5rem] mb-3">
            {quizPhase === 'checking' && (
              <p className={cn(
                'text-sm font-bold',
                currentAns === currentQ.correctAnswer ? 'text-green-400' : 'text-red-400',
              )}>
                {currentAns === currentQ.correctAnswer
                  ? '✓ Correct!'
                  : `✗ The answer is: ${currentQ.options[currentQ.correctAnswer]}`}
              </p>
            )}
          </div>
          <button
            disabled={currentAns === undefined && quizPhase === 'question'}
            onClick={quizPhase === 'question' ? handleCheck : handleContinue}
            className={cn(
              'w-full h-14 rounded-2xl text-white text-lg font-black transition-all duration-150',
              'flex items-center justify-center gap-2',
              currentAns === undefined && quizPhase === 'question'
                ? 'opacity-40 cursor-not-allowed'
                : 'shadow-[0_4px_0_rgba(0,0,0,0.4)] active:shadow-none active:translate-y-1',
            )}
            style={{
              background: quizPhase === 'checking' && currentAns === currentQ.correctAnswer
                ? 'linear-gradient(135deg, #10B981, #047857)'
                : quizPhase === 'checking'
                ? 'linear-gradient(135deg, #EF4444, #DC2626)'
                : `linear-gradient(135deg, ${from}, ${to})`,
            }}
          >
            {quizPhase === 'question' ? 'Check Answer' : isLastQ ? 'See Results' : 'Continue'}
          </button>
        </div>

        <ExitConfirmSheet isOpen={showExitSheet} onConfirm={onBack} onCancel={() => setShowExitSheet(false)} />
      </motion.div>
    , document.body)
  }

  // ── CONTENT SCREEN ────────────────────────────────────────────────────────
  return createPortal(
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col"
      style={{ background: '#0f0f1a' }}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
    >
      <TopBar />

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={contentPage}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="px-5 pt-4 pb-6 min-h-full"
          >
            {isVideoPage && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wide">
                    {course.moduleType === 'video' ? 'Video' : course.moduleType === 'guide' ? 'Video + Reading' : 'Reading'}
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-black leading-tight">{course.title}</h1>
                  {course.description && (
                    <p className="text-muted-foreground">{course.description}</p>
                  )}
                </div>

                <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl ring-1 ring-white/10">
                  {course.videoUrl!.includes('youtube.com') || course.videoUrl!.includes('youtu.be') ? (
                    <iframe
                      src={course.videoUrl!.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                      className="absolute inset-0 w-full h-full"
                      allowFullScreen
                      title={course.title}
                    />
                  ) : (
                    <video src={course.videoUrl!} controls className="w-full h-full" title={course.title} />
                  )}
                </div>

                {(course.duration || textPages.length > 0 || hasQuiz) && (
                  <p className="text-xs text-muted-foreground text-center">
                    {[
                      course.duration ? `${course.duration} min` : null,
                      textPages.length > 0 ? `${textPages.length} reading ${textPages.length === 1 ? 'page' : 'pages'}` : null,
                      hasQuiz ? 'quiz' : null,
                    ].filter(Boolean).join(' · ')}
                    {(textPages.length > 0 || hasQuiz) && ' · press Continue when ready'}
                  </p>
                )}
              </div>
            )}

            {!isVideoPage && textPages[textIdx] && (
              <div className="space-y-4">
                {textPages.length > 1 && (
                  <span
                    className="inline-flex items-center text-xs font-black uppercase tracking-widest text-white rounded-full px-3 py-1"
                    style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                  >
                    {contentPage - (hasVideo ? 1 : 0) + 1} / {textPages.length}
                  </span>
                )}
                <div
                  className="prose prose-invert max-w-none
                    prose-headings:font-black prose-h2:text-2xl prose-h3:text-xl
                    prose-p:text-base prose-p:leading-relaxed prose-p:text-muted-foreground
                    prose-li:text-muted-foreground prose-li:leading-relaxed
                    prose-strong:text-foreground prose-strong:font-bold"
                  dangerouslySetInnerHTML={{ __html: textPages[textIdx] }}
                />
              </div>
            )}

            {!hasVideo && textPages.length === 0 && (
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-3">
                <FileText className="h-12 w-12 text-muted-foreground/30" />
                <p className="text-muted-foreground">No content for this module.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex-shrink-0 px-5 pb-10 pt-4 border-t border-border/10 space-y-3">
        {totalContent > 1 && (
          <div className="flex items-center justify-center gap-1.5">
            {Array.from({ length: totalContent }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === contentPage
                    ? 'w-6 bg-primary'
                    : i < contentPage
                    ? 'w-1.5 bg-green-500/50'
                    : 'w-1.5 bg-muted-foreground/25',
                )}
              />
            ))}
          </div>
        )}

        <div className={cn('flex gap-3', contentPage === 0 ? 'justify-end' : 'justify-between')}>
          {contentPage > 0 && (
            <button
              onClick={() => setContentPage(p => Math.max(0, p - 1))}
              className="h-14 px-6 rounded-2xl border border-border font-bold text-base transition-colors hover:bg-accent/40"
            >
              ← Back
            </button>
          )}

          {!isLastPage ? (
            <button
              onClick={() => setContentPage(p => p + 1)}
              className="flex-1 h-14 rounded-2xl text-white text-lg font-black flex items-center justify-center gap-2 shadow-[0_4px_0_rgba(0,0,0,0.4)] active:shadow-none active:translate-y-1 transition-all duration-150"
              style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
            >
              Continue →
            </button>
          ) : hasQuiz ? (
            <button
              onClick={() => setStep('quiz')}
              className="flex-1 h-14 rounded-2xl text-white text-lg font-black flex items-center justify-center gap-2 shadow-[0_4px_0_rgba(0,0,0,0.4)] active:shadow-none active:translate-y-1 transition-all duration-150"
              style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
            >
              Go to Quiz <ArrowRight className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={markComplete}
              disabled={loading}
              className={cn(
                'flex-1 h-14 rounded-2xl text-white text-lg font-black flex items-center justify-center gap-2 transition-all duration-150',
                loading
                  ? 'opacity-70 cursor-not-allowed'
                  : 'shadow-[0_4px_0_rgba(0,0,0,0.4)] active:shadow-none active:translate-y-1',
              )}
              style={{ background: 'linear-gradient(135deg, #10B981, #047857)' }}
            >
              {loading
                ? <><Loader2 className="h-5 w-5 animate-spin" /> Completing…</>
                : <><CheckCircle className="h-5 w-5" /> Mark as Complete</>}
            </button>
          )}
        </div>
      </div>

      <ExitConfirmSheet isOpen={showExitSheet} onConfirm={onBack} onCancel={() => setShowExitSheet(false)} />
    </motion.div>
  , document.body)
}
