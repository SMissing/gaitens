'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, ArrowRight, RotateCcw, Eye } from 'lucide-react'
import type { QuizQuestion } from '@/types/database'
import { cn } from '@/lib/utils'

interface TrainingQuizProps {
  courseId: string
  questions: QuizQuestion[]
  onComplete: () => void
  autoStart?: boolean
}

type QuizPhase = 'question' | 'checking' | 'results' | 'review'

export function TrainingQuiz({ courseId, questions, onComplete, autoStart = false }: TrainingQuizProps) {
  const [showQuiz, setShowQuiz] = useState(autoStart)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<(number | undefined)[]>(
    new Array(questions.length).fill(undefined),
  )
  const [phase, setPhase] = useState<QuizPhase>('question')
  const [score, setScore] = useState(0)

  if (!showQuiz) {
    return (
      <Button onClick={() => setShowQuiz(true)} className="w-full" variant="outline">
        <CheckCircle className="h-4 w-4 mr-2" />
        Start Quiz ({questions.length} {questions.length === 1 ? 'question' : 'questions'})
      </Button>
    )
  }

  const question = questions[currentQuestion]
  const selectedAnswer = selectedAnswers[currentQuestion]
  const isLastQuestion = currentQuestion === questions.length - 1

  const handleSelect = (idx: number) => {
    if (phase !== 'question') return
    const updated = [...selectedAnswers]
    updated[currentQuestion] = idx
    setSelectedAnswers(updated)
  }

  // DC-13: "Check" reveals correct/incorrect per option
  const handleCheck = () => {
    if (selectedAnswer === undefined) return
    setPhase('checking')
  }

  const handleContinue = () => {
    if (isLastQuestion) {
      const correct = questions.reduce(
        (acc, q, idx) => (selectedAnswers[idx] === q.correctAnswer ? acc + 1 : acc),
        0,
      )
      setScore(correct)
      setPhase('results')
    } else {
      setCurrentQuestion(prev => prev + 1)
      setPhase('question')
    }
  }

  const handleCompleteTraining = async () => {
    try {
      const res = await fetch('/api/training/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, score }),
      })
      if (res.ok) {
        onComplete()
      } else {
        const err = await res.json().catch(() => ({ error: 'Failed to complete training' }))
        alert(`Error: ${err.error || 'Failed to complete training. Please try again.'}`)
      }
    } catch {
      alert('Error: Failed to complete training. Please try again.')
    }
  }

  const handleRetry = () => {
    setCurrentQuestion(0)
    setSelectedAnswers(new Array(questions.length).fill(undefined))
    setPhase('question')
    setScore(0)
  }

  // DC-05: review screen showing correct/incorrect per question
  if (phase === 'review') {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Review Your Answers</CardTitle>
          <CardDescription>See where you went wrong, then try again</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((q, idx) => {
            const userAns = selectedAnswers[idx]
            return (
              <div key={idx} className="space-y-2">
                <p className="text-sm font-semibold">
                  {idx + 1}. {q.question}
                </p>
                <div className="space-y-1.5">
                  {q.options.map((opt, optIdx) => {
                    const isCorrectOpt = optIdx === q.correctAnswer
                    const isUserChoice = optIdx === userAns
                    return (
                      <div
                        key={optIdx}
                        className={cn(
                          'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm',
                          isCorrectOpt && 'border-green-500/60 bg-green-500/10 text-green-400',
                          isUserChoice && !isCorrectOpt && 'border-red-500/60 bg-red-500/10 text-red-400',
                          !isCorrectOpt && !isUserChoice && 'border-border/20 text-muted-foreground opacity-40',
                        )}
                      >
                        {isCorrectOpt
                          ? <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                          : isUserChoice
                          ? <XCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                          : <div className="h-3.5 w-3.5 flex-shrink-0" />}
                        <span>{opt}</span>
                        {isCorrectOpt && (
                          <span className="ml-auto text-xs text-green-500 flex-shrink-0">Correct</span>
                        )}
                        {isUserChoice && !isCorrectOpt && (
                          <span className="ml-auto text-xs text-red-500 flex-shrink-0">Your answer</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
          <Button onClick={handleRetry} className="w-full">
            <RotateCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Results screen
  if (phase === 'results') {
    const passed = score === questions.length
    return (
      <Card className="border-2">
        <CardContent className="p-8 text-center space-y-4">
          {passed ? (
            <>
              <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
              <h3 className="text-2xl font-bold">Perfect Score!</h3>
              <p className="text-muted-foreground">
                You got {score} of {questions.length} correct
              </p>
              <Button onClick={handleCompleteTraining} className="w-full">
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Training
              </Button>
            </>
          ) : (
            <>
              <XCircle className="h-16 w-16 mx-auto text-red-500" />
              <h3 className="text-2xl font-bold">Almost There!</h3>
              <p className="text-muted-foreground">
                {score}/{questions.length} correct — you need all correct to complete this training.
              </p>
              <div className="flex gap-3 pt-1">
                <Button onClick={() => setPhase('review')} variant="outline" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  Review Answers
                </Button>
                <Button onClick={handleRetry} className="flex-1">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    )
  }

  // Question screen (phases: 'question' and 'checking')
  const isChecking = phase === 'checking'

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Knowledge Check</CardTitle>
        <CardDescription>Question {currentQuestion + 1} of {questions.length}</CardDescription>
        <div className="w-full bg-muted rounded-full h-2 mt-2 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 rounded-full"
            style={{ width: `${((currentQuestion + (isChecking ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <h3 className="text-lg font-semibold">{question.question}</h3>
        <div className="space-y-2">
          {question.options.map((option, idx) => {
            const isSelected = selectedAnswer === idx
            const isCorrectOpt = idx === question.correctAnswer

            // DC-13: colour coding after "Check" is clicked
            let rowStyle = ''
            if (isChecking) {
              if (isCorrectOpt) {
                rowStyle = 'border-green-500 bg-green-500/15'
              } else if (isSelected) {
                rowStyle = 'border-red-500 bg-red-500/15'
              } else {
                rowStyle = 'border-border/20 opacity-40'
              }
            } else {
              rowStyle = isSelected
                ? 'border-primary bg-primary/20 shadow-sm'
                : 'border-border hover:border-primary/50 hover:bg-accent/50'
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={isChecking}
                className={cn(
                  'w-full text-left p-3 rounded-lg border-2 transition-all duration-150',
                  rowStyle,
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                    isChecking && isCorrectOpt && 'border-green-500 bg-green-500',
                    isChecking && isSelected && !isCorrectOpt && 'border-red-500 bg-red-500',
                    !isChecking && isSelected && 'border-primary bg-primary',
                    !isChecking && !isSelected && 'border-border',
                  )}>
                    {isChecking && isCorrectOpt && <CheckCircle className="h-3 w-3 text-white" />}
                    {isChecking && isSelected && !isCorrectOpt && <XCircle className="h-3 w-3 text-white" />}
                  </div>
                  <span className={cn(
                    isSelected && !isChecking && 'font-medium',
                    isChecking && isCorrectOpt && 'text-green-300 font-medium',
                    isChecking && isSelected && !isCorrectOpt && 'text-red-300',
                  )}>
                    {option}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {!isChecking ? (
          <Button onClick={handleCheck} disabled={selectedAnswer === undefined} className="w-full">
            Check Answer
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleContinue} className="w-full">
            {isLastQuestion ? 'See Results' : 'Continue'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
