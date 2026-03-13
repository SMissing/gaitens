'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, ArrowRight, RotateCcw } from 'lucide-react'
import type { QuizQuestion } from '@/types/database'

interface TrainingQuizProps {
  courseId: string
  questions: QuizQuestion[]
  onComplete: () => void
  autoStart?: boolean
}

export function TrainingQuiz({ courseId, questions, onComplete, autoStart = false }: TrainingQuizProps) {
  const [showQuiz, setShowQuiz] = useState(autoStart)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

  const handleAnswer = (answerIndex: number) => {
    if (showResults) return
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestion] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      // Calculate score
      let correct = 0
      questions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctAnswer) {
          correct++
        }
      })
      setScore(correct)
      setShowResults(true)
    }
  }

  const handleComplete = async () => {
    if (score < questions.length) {
      // Failed - reset
      setCurrentQuestion(0)
      setSelectedAnswers([])
      setShowResults(false)
      setScore(0)
      return
    }

    // Passed - mark as complete
    try {
      const response = await fetch('/api/training/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, score }),
      })

      if (response.ok) {
        onComplete()
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to complete training' }))
        console.error('Error completing training:', errorData.error || 'Unknown error')
        alert(`Error: ${errorData.error || 'Failed to complete training. Please try again.'}`)
      }
    } catch (error) {
      console.error('Error completing training:', error)
      alert('Error: Failed to complete training. Please try again.')
    }
  }

  if (!showQuiz) {
    return (
      <Button onClick={() => setShowQuiz(true)} className="w-full" variant="outline">
        <CheckCircle className="h-4 w-4 mr-2" />
        Start Quiz ({questions.length} questions)
      </Button>
    )
  }

  const question = questions[currentQuestion]
  const selectedAnswer = selectedAnswers[currentQuestion]
  const isLastQuestion = currentQuestion === questions.length - 1
  const canProceed = selectedAnswer !== undefined

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Knowledge Check</CardTitle>
        <CardDescription>
          Question {currentQuestion + 1} of {questions.length}
        </CardDescription>
        <div className="w-full bg-muted rounded-full h-2 mt-2">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showResults ? (
          <div className="text-center space-y-4">
            {score === questions.length ? (
              <>
                <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
                <h3 className="text-2xl font-bold">Perfect Score!</h3>
                <p className="text-muted-foreground">
                  You got {score} out of {questions.length} questions correct
                </p>
                <Button onClick={handleComplete} className="w-full">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Training as Complete
                </Button>
              </>
            ) : (
              <>
                <XCircle className="h-16 w-16 mx-auto text-red-500" />
                <h3 className="text-2xl font-bold">Almost There!</h3>
                <p className="text-muted-foreground">
                  You got {score} out of {questions.length} questions correct. 
                  You need to answer all questions correctly to complete this training.
                </p>
                <Button onClick={handleComplete} variant="outline" className="w-full">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </>
            )}
          </div>
        ) : (
          <>
            <div>
              <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
              <div className="space-y-2">
                {question.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all relative ${
                      selectedAnswer === idx
                        ? 'border-primary bg-primary/20 shadow-md'
                        : 'border-border hover:border-primary/50 hover:bg-accent/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {selectedAnswer === idx && (
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <CheckCircle className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                      {selectedAnswer !== idx && (
                        <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-border" />
                      )}
                      <span className={selectedAnswer === idx ? 'font-medium' : ''}>{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className="w-full"
            >
              {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
