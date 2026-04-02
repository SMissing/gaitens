'use client'

import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'
import { AppFeedbackForm } from './AppFeedbackForm'

interface AppFeedbackFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmitted?: () => void
}

export function AppFeedbackFormModal({ isOpen, onClose, onSubmitted }: AppFeedbackFormModalProps) {
  const [mounted, setMounted] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setTimeout(() => setIsAnimating(true), 10)
    } else {
      document.body.style.overflow = ''
      setIsAnimating(false)
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen || !mounted) return null

  const handleSubmitted = () => {
    onSubmitted?.()
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const modalContent = (
    <div
      className={`fixed inset-0 z-[70] bg-background/95 backdrop-blur-xl transition-opacity duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClick}
    >
      <div className="h-full flex items-center justify-center px-4 py-8 sm:py-12 overflow-y-auto">
        <div
          className={`w-full max-w-2xl transition-all duration-300 ${
            isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <AppFeedbackForm onSubmitted={handleSubmitted} onClose={onClose} />
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
