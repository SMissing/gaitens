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
  calculateCourseXP, addXP, updateStreak, getTotalXP, getStreak,
} from '@/lib/training-xp'

interface CoursePageProps {
  course: TrainingCourse & {
    completed: boolean
    required: boolean
    completion?: { completedAt: string; expiresAt: string }
  }
  onComplete: () => void
  onBack: () => void
}

type LessonStep = 'content' | 'choice' | 'quiz' | 'results' | 'review' | 'completed'

// ── Confetti ─────────────────────────────────────────────────────────────────
const CONFETTI = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  color: ['#ffd700','#ff6b6b','#4ecdc4','#45b7d1','#a29bfe','#fd79a8','#00b894'][i % 7],
  angle: (i / 20) * 360,
  dist: 70 + (i % 4) * 25,
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
export function CoursePage({ course, onComplete, onBack }: CoursePageProps) {
  const questions   = (course.quizQuestions ?? []) as QuizQuestion[]
  const hasQuiz     = questions.length > 0
  const hasVideo    = !!(course.videoUrl && course.moduleType === 'video')
  const textPages   = useMemo(() => paginateHTML(course.content), [course.content])
  const totalContent = (hasVideo ? 1 : 0) + textPages.length
  const [from, to]  = getModuleColor(course.moduleType)

  // ── Step & content paging ─────────────────────────────────────────────────
  const [step, setStep]           = useState<LessonStep>('content')
  const [contentPage, setContentPage] = useState(0)

  // ── Quiz state ────────────────────────────────────────────────────────────
  const [quizIdx, setQuizIdx]         = useState(0)
  const [answers, setAnswers]         = useState<(number | undefined)[]>(
    new Array(questions.length).fill(undefined),
  )
  const [quizPhase, setQuizPhase]     = useState<'question' | 'checking'>('question')
  const [quizScore, setQuizScore]     = useState(0)
  const [reviewMode, setReviewMode]   = useState(false)

  // ── Celebration ───────────────────────────────────────────────────────────
  const [earnedXP, setEarnedXP]   = useState(0)
  const [streak, setStreak]       = useState(0)
  const [totalXP, setTotalXP]     = useState(0)
  const [loading, setLoading]     = useState(false)
  const isMountedRef              = useRef(true)
  // Portal guard — document.body is not available during SSR
  const [mounted, setMounted]     = useState(false)

  const isVideoPage = hasVideo && contentPage === 0
  const textIdx     = hasVideo ? contentPage - 1 : contentPage
  const isLastPage  = totalContent === 0 || contentPage >= totalContent - 1
  const currentQ    = questions[quizIdx]
  const currentAns  = answers[quizIdx]
  const isLastQ     = quizIdx === questions.length - 1

  // Progress bar value (0-100)
  const progressPct = useMemo(() => {
    if (step === 'completed') return 100
    if (step === 'quiz' || step === 'results' || step === 'review') {
      const base = totalContent > 0 ? 100 : 0
      if (questions.length === 0) return base
      return base + 0 // keep at 100 during quiz (full bar)
    }
    if (totalContent === 0) return 50
    return Math.round(((contentPage + 1) / totalContent) * 100)
  }, [step, contentPage, totalContent, questions.length])

  // Mount portal + resume state + seed streak from localStorage.
  // All localStorage reads must live here — the server has no localStorage,
  // so any read during render produces a hydration mismatch.
  useEffect(() => {
    setMounted(true)
    isMountedRef.current = true
    setStreak(getStreak())   // seed TopBar streak from localStorage on mount
    if (hasResumeState(course.id) && hasQuiz) {
      setStep(totalContent > 0 ? 'choice' : 'quiz')
    }
    return () => { isMountedRef.current = false }
  }, [course.id, hasQuiz, totalContent])

  // Save resume state on last content page
  useEffect(() => {
    if (isLastPage && totalContent > 0 && hasQuiz) saveResumeState(course.id)
  }, [isLastPage, totalContent, course.id, hasQuiz])

  // ── Actions ───────────────────────────────────────────────────────────────
  const celebrate = () => {
    const xp  = calculateCourseXP(course.duration)
    const nxp = addXP(xp)
    const str = updateStreak()
    clearResumeState(course.id)
    setEarnedXP(xp); setTotalXP(nxp); setStreak(str)
    setLoading(false); setStep('completed')
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

  // Content navigation
  const goNextContent = () => {
    if (!isLastPage) { setContentPage(p => p + 1) }
    else if (hasQuiz) { setStep('quiz') }
    else { markComplete() }
  }

  // Quiz actions
  const handleCheck = () => { if (currentAns !== undefined) setQuizPhase('checking') }
  const handleContinue = () => {
    if (isLastQ) {
      const correct = questions.reduce((n, q, i) => n + (answers[i] === q.correctAnswer ? 1 : 0), 0)
      setQuizScore(correct)
      setStep('results')
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

  // ── Layout helpers ────────────────────────────────────────────────────────

  // Top bar shown in all lesson steps
  const TopBar = ({ progress = progressPct }: { progress?: number }) => (
    <div className="flex-shrink-0 flex items-center gap-3 px-4 pt-4 pb-3">
      <button
        onClick={onBack}
        className="w-9 h-9 flex items-center justify-center rounded-full text-muted-foreground hover:bg-accent/50 transition-colors flex-shrink-0"
        aria-label="Exit lesson"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Progress bar */}
      <div className="flex-1 h-3.5 bg-muted/60 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${from}, ${to})` }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      {/* Streak chip — uses state value seeded from localStorage on mount */}
      {streak > 0 && (
        <div className="flex items-center gap-1 text-orange-400 flex-shrink-0">
          <Flame className="h-4 w-4" />
          <span className="text-sm font-bold">{streak}</span>
        </div>
      )}
    </div>
  )

  // ── CHOICE SCREEN (resume — let user decide to rewatch or jump to quiz) ──
  if (!mounted) return null

  if (step === 'choice') {
    return createPortal(
      <div
        className="fixed inset-0 z-[200] flex flex-col"
        style={{ background: '#0f0f1a' }}
      >
        {/* X exit */}
        <div className="flex-shrink-0 px-4 pt-4 pb-2">
          <button
            onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-full text-muted-foreground hover:bg-accent/50 transition-colors"
            aria-label="Back to training path"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Choice content — vertically centred */}
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
              {/* Start content from beginning */}
              <button
                onClick={() => {
                  clearResumeState(course.id)
                  setContentPage(0)
                  setStep('content')
                }}
                className="w-full h-14 rounded-2xl border border-border/50 font-bold text-base flex items-center justify-center gap-3 transition-colors hover:bg-accent/20 active:bg-accent/40"
              >
                {hasVideo
                  ? <Play className="h-5 w-5" />
                  : <FileText className="h-5 w-5" />}
                {hasVideo ? 'Watch video again' : 'Read again'}
              </button>

              {/* Go straight to quiz */}
              <button
                onClick={() => setStep('quiz')}
                className="w-full h-14 rounded-2xl text-white text-base font-black flex items-center justify-center gap-2 shadow-lg"
                style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
              >
                Continue to Quiz
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    , document.body)
  }

  // ── COMPLETED SCREEN ──────────────────────────────────────────────────────
  if (step === 'completed') {
    return createPortal(
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center px-6" style={{ background: '#0f0f1a' }}>
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
      </div>
    , document.body)
  }

  // ── REVIEW SCREEN (quiz failure review) ───────────────────────────────────
  if (step === 'review') {
    return createPortal(
      <div className="fixed inset-0 z-[200] flex flex-col" style={{ background: '#0f0f1a' }}>
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
            className="w-full h-14 rounded-2xl text-white text-lg font-black flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
          >
            <RotateCcw className="h-5 w-5" /> Try Again
          </button>
        </div>
      </div>
    , document.body)
  }

  // ── RESULTS SCREEN ────────────────────────────────────────────────────────
  if (step === 'results') {
    return createPortal(
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center px-6" style={{ background: '#0f0f1a' }}>
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
              className="w-full h-14 rounded-2xl text-white text-lg font-black flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #10B981, #047857)' }}
            >
              <CheckCircle className="h-5 w-5" /> Complete
            </button>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => setStep('review')}
                className="w-full h-14 rounded-2xl border border-border text-base font-bold flex items-center justify-center gap-2"
              >
                <Eye className="h-5 w-5" /> Review Answers
              </button>
              <button
                onClick={handleRetry}
                className="w-full h-14 rounded-2xl text-white text-lg font-black flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
              >
                <RotateCcw className="h-5 w-5" /> Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    , document.body)
  }

  // ── QUIZ SCREEN ───────────────────────────────────────────────────────────
  if (step === 'quiz' && questions.length > 0) {
    const quizProgress = Math.round(((quizIdx + (quizPhase === 'checking' ? 1 : 0)) / questions.length) * 100)

    return createPortal(
      <div className="fixed inset-0 z-[200] flex flex-col" style={{ background: '#0f0f1a' }}>
        <TopBar progress={quizProgress} />

        {/* Question counter */}
        <div className="flex-shrink-0 px-5 pt-2 pb-1">
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wide">
            Question {quizIdx + 1} of {questions.length}
          </p>
        </div>

        {/* Scrollable question + options */}
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
              {/* Question */}
              <h2 className="text-xl sm:text-2xl font-bold leading-snug">{currentQ.question}</h2>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((opt, oi) => {
                  const isSelected = currentAns === oi
                  const isCorrect  = oi === currentQ.correctAnswer
                  const checking   = quizPhase === 'checking'

                  let border = 'border-border/60'
                  let bg     = 'bg-transparent'
                  let textCl = ''
                  if (!checking && isSelected) { border = 'border-primary'; bg = 'bg-primary/30' }
                  if (checking && isCorrect)   { border = 'border-green-500'; bg = 'bg-green-500/15'; textCl = 'text-green-300' }
                  if (checking && isSelected && !isCorrect) { border = 'border-red-500'; bg = 'bg-red-500/15'; textCl = 'text-red-300' }

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
                        !checking && 'active:scale-[0.98] cursor-pointer',
                        checking && 'cursor-default',
                      )}
                    >
                      {/* Letter label */}
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
                      {/* Selected signifier — radio dot on trailing edge */}
                      <div className={cn(
                        'flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-150 flex items-center justify-center',
                        !checking && isSelected
                          ? 'border-primary bg-primary'
                          : 'border-border/40 bg-transparent',
                      )}>
                        {isSelected && !checking && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pinned action button */}
        <div className={cn(
          'flex-shrink-0 px-5 pb-10 pt-4 border-t transition-colors duration-300',
          quizPhase === 'checking' && currentAns === currentQ.correctAnswer
            ? 'border-green-500/30 bg-green-500/5'
            : quizPhase === 'checking'
            ? 'border-red-500/30 bg-red-500/5'
            : 'border-border/10',
        )}>
          {quizPhase === 'checking' && (
            <p className={cn(
              'text-sm font-bold mb-3',
              currentAns === currentQ.correctAnswer ? 'text-green-400' : 'text-red-400',
            )}>
              {currentAns === currentQ.correctAnswer ? '✓ Correct!' : `✗ The answer is: ${currentQ.options[currentQ.correctAnswer]}`}
            </p>
          )}
          <button
            disabled={currentAns === undefined && quizPhase === 'question'}
            onClick={quizPhase === 'question' ? handleCheck : handleContinue}
            className={cn(
              'w-full h-14 rounded-2xl text-white text-lg font-black transition-all duration-150',
              'flex items-center justify-center gap-2',
              currentAns === undefined && quizPhase === 'question'
                ? 'opacity-40 cursor-not-allowed'
                : 'active:scale-[0.98] shadow-lg',
            )}
            style={{
              background: quizPhase === 'checking' && currentAns === currentQ.correctAnswer
                ? 'linear-gradient(135deg, #10B981, #047857)'
                : quizPhase === 'checking'
                ? 'linear-gradient(135deg, #EF4444, #DC2626)'
                : `linear-gradient(135deg, ${from}, ${to})`,
            }}
          >
            {quizPhase === 'question'
              ? 'Check Answer'
              : isLastQ ? 'See Results' : 'Continue'}
          </button>
        </div>
      </div>
    , document.body)
  }

  // ── CONTENT SCREEN ────────────────────────────────────────────────────────
  return createPortal(
    <div className="fixed inset-0 z-[200] flex flex-col" style={{ background: '#0f0f1a' }}>
      <TopBar />

      {/* Scrollable content area */}
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
            {/* ── Video page ──────────────────────────────────────── */}
            {isVideoPage && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wide">
                    {course.moduleType === 'video' ? 'Video' : 'Guide'}
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

                {course.duration && (
                  <p className="text-xs text-muted-foreground text-center">
                    {course.duration} min
                    {(textPages.length > 0 || hasQuiz) && ' · press Continue when ready'}
                  </p>
                )}
              </div>
            )}

            {/* ── Text section page ────────────────────────────────── */}
            {!isVideoPage && textPages[textIdx] && (
              <div className="space-y-4">
                {/* Section number pill */}
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

            {/* ── Empty state ──────────────────────────────────────── */}
            {!hasVideo && textPages.length === 0 && (
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-3">
                <FileText className="h-12 w-12 text-muted-foreground/30" />
                <p className="text-muted-foreground">No content for this module.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pinned bottom action */}
      <div className="flex-shrink-0 px-5 pb-10 pt-4 border-t border-border/10 space-y-3">
        {/* Page dots */}
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
              className="flex-1 h-14 rounded-2xl text-white text-lg font-black shadow-lg flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
            >
              Continue →
            </button>
          ) : hasQuiz ? (
            <button
              onClick={() => setStep('quiz')}
              className="flex-1 h-14 rounded-2xl text-white text-lg font-black shadow-xl flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
            >
              Go to Quiz <ArrowRight className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={markComplete}
              disabled={loading}
              className={cn(
                'flex-1 h-14 rounded-2xl text-white text-lg font-black shadow-xl flex items-center justify-center gap-2',
                loading && 'opacity-70 cursor-not-allowed',
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
    </div>
  , document.body)
}
