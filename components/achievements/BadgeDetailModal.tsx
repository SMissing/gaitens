'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import type { Achievement, UserAchievement } from '@/types/database'
import { AchievementBadge } from './AchievementBadge'
import { cn } from '@/lib/utils'

interface BadgeDetailModalProps {
  achievement: Achievement
  userAchievement?: UserAchievement
  isOpen: boolean
  onClose: () => void
}

export function BadgeDetailModal({
  achievement,
  userAchievement,
  isOpen,
  onClose,
}: BadgeDetailModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const isUnlocked = !!userAchievement
  const isCompleted = userAchievement?.completed ?? false
  const progress = userAchievement?.currentProgress ?? 0

  // Get rarity
  const rawRarity = achievement.rarity || null
  const rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' = 
    (rawRarity && typeof rawRarity === 'string' && ['Common', 'Rare', 'Epic', 'Legendary'].includes(rawRarity)) 
      ? rawRarity as 'Common' | 'Rare' | 'Epic' | 'Legendary'
      : 'Common'

  const getRarityColor = () => {
    switch (rarity) {
      case 'Common':
        return 'text-gray-400'
      case 'Rare':
        return 'text-blue-500'
      case 'Epic':
        return 'text-purple-500'
      case 'Legendary':
        return 'text-yellow-500'
      default:
        return 'text-spirits-cyan'
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-2xl border border-border shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Badge Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Badge Display */}
          <div className="flex flex-col items-center">
            <AchievementBadge
              achievement={achievement}
              userAchievement={userAchievement}
              size="lg"
              showProgress={true}
            />
          </div>

          {/* Badge Name */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {achievement.name}
            </h3>
            {rarity && (
              <div className={cn('text-sm font-semibold', getRarityColor())}>
                {rarity}
              </div>
            )}
          </div>

          {/* Status */}
          {isUnlocked ? (
            <div className="text-center">
              {isCompleted ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-500 rounded-full border border-green-500/30">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-semibold">Completed</span>
                </div>
              ) : achievement.requiresProgress ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-500 rounded-full border border-blue-500/30">
                  <span className="font-semibold">
                    Progress: {progress}/{achievement.requiredCount}
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-spirits-cyan/20 text-spirits-cyan rounded-full border border-spirits-cyan/30">
                  <span className="font-semibold">Unlocked</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-full border border-border">
                <span className="font-semibold">Locked</span>
              </div>
            </div>
          )}

          {/* Description */}
          {achievement.description && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                How to Earn
              </h4>
              <p className="text-foreground leading-relaxed">
                {achievement.description}
              </p>
            </div>
          )}

          {/* Progress-based info */}
          {achievement.requiresProgress && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Requirements
              </h4>
              <p className="text-foreground">
                This badge requires {achievement.requiredCount} {achievement.requiredCount === 1 ? 'completion' : 'completions'} to unlock.
                {isUnlocked && !isCompleted && (
                  <span className="block mt-2 text-muted-foreground">
                    You're {progress}/{achievement.requiredCount} of the way there!
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
