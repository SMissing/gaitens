'use client'

import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, CheckCircle, XCircle, Star, Flame, ArrowRight } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/utils'
import type { QuizQuestion } from '@/types/database'
import { getStreak, updateStreak, recordTrainingActivity, PRACTICE_XP } from '@/lib/training-xp'
import { SFX } from '@/lib/training-sfx'

interface PracticeSessionProps {
  questions: QuizQuestion[]
  existingXP: number
  onComplete: (earnedXP: number) => void
  onBack: () => void
}

const OPTION_LABELS = ['A', 'B', 'C', 'D']

type PracticeStep = 'quiz' | 'completed'

export function PracticeSession({ questions, existingXP, onComplete, onBack }: PracticeSessionProps) {
  const [step, setStep]         = useState<PracticeStep>('quiz')
  const [quizIdx, setQuizIdx]   = useState(0)
  const [answers, setAnswers]   = useState<(number | undefined)[]>(
    new Array(questions.length).fill(undefined),
  )
  const [quizPhase, setQuizPhase] = useState<'question' | 'checking'>('question')
  const [correctCount, setCorrectCount] = useState(0)
  const [streak, setStreak]     = useState(() => getStreak())
  const [showExitSheet, setShowExitSheet] = useState(false)
  const isMountedRef            = useRef(true)

  const currentQ   = questions[quizIdx]
  const currentAns = answers[quizIdx]
  const isLastQ    = quizIdx === questions.length - 1
  const progressPct = Math.round(((quizIdx + (quizPhase === 'checking' ? 1 : 0)) / questions.length) * 100)

  const handleCheck = () => {
    if (currentAns === undefined) return
    setQuizPhase('checking')
    if (currentAns === currentQ.correctAnswer) {
      setCorrectCount(n => n + 1)
      SFX.correct()
    } else {
      SFX.wrong()
    }
  }

  const handleContinue = () => {
    if (isLastQ) {
      // Practice complete — update streak + sync to DB
      const localStreak = updateStreak()
      setStreak(localStreak)
      setStep('completed')
      SFX.victory()
      recordTrainingActivity()
        .then(s => { if (isMountedRef.current) setStreak(s) })
        .catch(() => {})
    } else {
      setQuizIdx(i => i + 1)
      setQuizPhase('question')
    }
  }

  // ── Exit confirmation sheet ──────────────────────────────────────────────
  const ExitSheet = () => (
    <AnimatePresence>
      {showExitSheet && (
        <motion.div
          className="absolute inset-0 z-10 flex flex-col justify-end"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ background: 'rgba(0,0,0,0.65)' }}
          onClick={() => setShowExitSheet(false)}
        >
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="rounded-t-3xl px-5 pb-10 pt-6 space-y-3"
            style={{ background: '#1a1a2e' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-black">Leave practice?</h3>
            <p className="text-sm text-muted-foreground pb-2">Your streak won&apos;t update until you finish.</p>
            <button
              onClick={() => setShowExitSheet(false)}
              className="w-full h-14 rounded-2xl text-white text-lg font-black shadow-[0_4px_0_rgba(0,0,0,0.4)] active:shadow-none active:translate-y-1 transition-all duration-150"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
            >
              Keep Practicing
            </button>
            <button
              onClick={onBack}
              className="w-full h-12 rounded-2xl text-muted-foreground text-base font-semibold border border-border/30 hover:bg-accent/20 transition-colors"
            >
              Leave
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  // ── Completed screen ─────────────────────────────────────────────────────
  if (step === 'completed') {
    const accuracy = Math.round((correctCount / questions.length) * 100)
    return createPortal(
      <motion.div
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center px-6"
        style={{ background: '#0f0f1a' }}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="text-center space-y-6 max-w-sm w-full">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.05 }}
            className="mx-auto text-7xl leading-none select-none"
          >
            ⚡
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <h1 className="text-4xl font-black">Practice done!</h1>
            <p className="text-muted-foreground mt-1">
              {correctCount}/{questions.length} correct · {accuracy}% accuracy
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="flex items-center justify-center gap-3 flex-wrap"
          >
            <div className="flex items-center gap-2 bg-yellow-500/15 text-yellow-400 rounded-2xl px-6 py-3">
              <Star className="h-5 w-5 fill-yellow-400" />
              <span className="font-black text-xl">+{PRACTICE_XP} XP</span>
            </div>
            {streak > 0 && (
              <div className="flex items-center gap-2 bg-orange-500/15 text-orange-400 rounded-2xl px-6 py-3">
                <Flame className="h-5 w-5" />
                <span className="font-black text-xl">{streak} 🔥</span>
              </div>
            )}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            className="text-sm text-muted-foreground"
          >
            {existingXP + PRACTICE_XP} total XP
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <button
              onClick={() => onComplete(PRACTICE_XP)}
              className="w-full h-14 rounded-2xl text-white text-lg font-black shadow-xl flex items-center justify-center gap-2 shadow-[0_4px_0_rgba(0,0,0,0.4)] active:shadow-none active:translate-y-1 transition-all duration-150"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
            >
              Done <ArrowRight className="h-5 w-5" />
            </button>
          </motion.div>
        </div>
      </motion.div>
    , document.body)
  }

  // ── Quiz screen ──────────────────────────────────────────────────────────
  return createPortal(
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col"
      style={{ background: '#0f0f1a' }}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Top bar */}
      <div
        className="flex-shrink-0 flex items-center gap-3 px-4 pb-3"
        style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 1rem)' }}
      >
        <button
          onClick={() => setShowExitSheet(true)}
          className="w-9 h-9 flex items-center justify-center rounded-full text-muted-foreground hover:bg-accent/50 transition-colors flex-shrink-0"
          aria-label="Exit practice"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Progress bar */}
        <div className="flex-1 h-3.5 bg-muted/60 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #f59e0b, #f97316)' }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>

        {/* Streak chip */}
        {streak > 0 && (
          <div className="flex items-center gap-1 text-orange-400 flex-shrink-0">
            <Flame className="h-4 w-4" />
            <span className="text-sm font-bold">{streak}</span>
          </div>
        )}
      </div>

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

      {/* Pinned action */}
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
              : 'linear-gradient(135deg, #f59e0b, #f97316)',
          }}
        >
          {quizPhase === 'question' ? 'Check Answer' : isLastQ ? 'Finish' : 'Continue'}
        </button>
      </div>

      <ExitSheet />
    </motion.div>
  , document.body)
}
