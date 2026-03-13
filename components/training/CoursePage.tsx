'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, CheckCircle, Loader2, Play, FileText, BookOpen, Trophy } from 'lucide-react'
import type { TrainingCourse, QuizQuestion } from '@/types/database'
import { TrainingQuiz } from './TrainingQuiz'

interface CoursePageProps {
  course: TrainingCourse & {
    completed: boolean
    required: boolean
    completion?: { completedAt: string; expiresAt: string }
  }
  onComplete: () => void
  onBack: () => void
}

type CourseStep = 'content' | 'quiz' | 'completed'

export function CoursePage({ course, onComplete, onBack }: CoursePageProps) {
  const [step, setStep] = useState<CourseStep>('content')
  const [contentViewed, setContentViewed] = useState(false)
  const [loading, setLoading] = useState(false)
  const isMountedRef = useRef(true)

  const hasQuiz = course.quizQuestions && course.quizQuestions.length > 0
  const hasContent = course.videoUrl || course.content

  // Auto-set content as viewed if there's no content but there is a quiz
  useEffect(() => {
    if (!hasContent && hasQuiz && !contentViewed) {
      setContentViewed(true)
    }
  }, [hasContent, hasQuiz, contentViewed])

  // Auto-advance to quiz after content is viewed (if quiz exists)
  useEffect(() => {
    if (contentViewed && hasQuiz && step === 'content') {
      const timer = setTimeout(() => {
        setStep('quiz')
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [contentViewed, hasQuiz, step])

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const handleContentComplete = () => {
    setContentViewed(true)
    if (!hasQuiz) {
      handleMarkComplete()
    }
  }

  const handleMarkComplete = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/training/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.id }),
      })

      if (response.ok) {
        if (isMountedRef.current) {
          setStep('completed')
        }
        setTimeout(() => {
          if (isMountedRef.current) {
            onComplete()
          }
        }, 1500)
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to complete training' }))
        console.error('Error completing training:', errorData.error || 'Unknown error')
        alert(`Error: ${errorData.error || 'Failed to complete training. Please try again.'}`)
        setLoading(false)
      }
    } catch (error) {
      console.error('Error completing training:', error)
      alert('Error: Failed to complete training. Please try again.')
      setLoading(false)
    }
  }

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="h-6 w-6" />
      case 'text':
        return <FileText className="h-6 w-6" />
      case 'guide':
        return <BookOpen className="h-6 w-6" />
      default:
        return <FileText className="h-6 w-6" />
    }
  }

  const getModuleColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'from-red-500 to-red-600'
      case 'text':
        return 'from-blue-500 to-cyan-600'
      case 'guide':
        return 'from-purple-500 to-purple-600'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  // Completed state
  if (step === 'completed') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md w-full border-2 border-green-500/50">
          <CardContent className="p-12 text-center space-y-4">
            <div className="mx-auto w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold">Course Complete!</h2>
            <p className="text-muted-foreground">
              Great job completing "{course.title}"
            </p>
            <div className="pt-4">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Quiz step
  if (step === 'quiz' && hasQuiz) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setStep('content')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <p className="text-muted-foreground">Knowledge Check</p>
          </div>
        </div>

        {/* Quiz Component */}
        <TrainingQuiz
          courseId={course.id}
          questions={course.quizQuestions as QuizQuestion[]}
          onComplete={() => {
            setStep('completed')
            setTimeout(() => {
              onComplete()
            }, 1500)
          }}
          autoStart={true}
        />
      </div>
    )
  }

  // Content step
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className={`bg-gradient-to-br ${getModuleColor(course.moduleType)} p-3 rounded-lg text-white shadow-lg`}>
              {getModuleIcon(course.moduleType)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{course.title}</h1>
              {course.description && (
                <p className="text-muted-foreground">{course.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <Card className="border-2">
        <CardContent className="p-6 space-y-6">
          {/* Video */}
          {course.videoUrl && course.moduleType === 'video' && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black shadow-lg">
              {course.videoUrl.includes('youtube.com') || course.videoUrl.includes('youtu.be') ? (
                <iframe
                  src={course.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                  className="absolute inset-0 w-full h-full"
                  allowFullScreen
                />
              ) : (
                <video 
                  src={course.videoUrl} 
                  controls 
                  className="w-full h-full"
                  onEnded={() => setContentViewed(true)}
                />
              )}
            </div>
          )}

          {/* Text Content */}
          {course.content && (
            <div
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: course.content }}
            />
          )}

          {/* No content message */}
          {!hasContent && (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>This course has no content to display.</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            {hasQuiz ? (
              <Button 
                onClick={handleContentComplete}
                disabled={loading || contentViewed}
                className="min-w-[150px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : contentViewed ? (
                  <>
                    <Trophy className="h-4 w-4 mr-2" />
                    Starting Quiz...
                  </>
                ) : (
                  <>
                    Continue to Quiz
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={handleMarkComplete}
                disabled={loading}
                className="min-w-[150px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Complete
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
