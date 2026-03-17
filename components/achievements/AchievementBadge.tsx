'use client'

import { cn } from '@/lib/utils'
import type { Achievement, UserAchievement } from '@/types/database'
import { Award } from 'lucide-react'

interface AchievementBadgeProps {
  achievement: Achievement
  userAchievement?: UserAchievement
  size?: 'sm' | 'md' | 'lg'
  showProgress?: boolean
  onClick?: () => void
}

export function AchievementBadge({ 
  achievement, 
  userAchievement, 
  size = 'md',
  showProgress = true,
  onClick
}: AchievementBadgeProps) {
  const isUnlocked = !!userAchievement
  const isCompleted = userAchievement?.completed ?? false
  const progress = userAchievement?.currentProgress ?? 0
  const progressPercentage = achievement.requiresProgress && achievement.requiredCount > 0
    ? Math.min(Math.max((progress / achievement.requiredCount) * 100, 0), 100)
    : 100
  
  // Get rarity - access directly from achievement object
  const rawRarity = achievement.rarity || (achievement as any).rarity || null
  const rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' = 
    (rawRarity && typeof rawRarity === 'string' && ['Common', 'Rare', 'Epic', 'Legendary'].includes(rawRarity)) 
      ? rawRarity as 'Common' | 'Rare' | 'Epic' | 'Legendary'
      : 'Common'

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  }

  const iconSizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  }

  // Rarity-based styling
  const getRarityStyles = () => {
    if (!isUnlocked) {
      return {
        border: 'border-muted-foreground/30',
        bg: 'bg-muted/20',
        glow: '',
        pulse: '',
        completionRing: '',
      }
    }

    switch (rarity) {
      case 'Common':
        return {
          border: 'border-gray-400',
          bg: isCompleted 
            ? 'bg-gradient-to-br from-gray-400/60 to-gray-500/60' 
            : 'bg-gradient-to-br from-gray-400/20 to-gray-500/20',
          glow: isCompleted ? 'shadow-lg shadow-gray-400/50' : '',
          pulse: '',
          completionRing: isCompleted ? 'ring-4 ring-gray-400/70 ring-offset-2 ring-offset-background' : '',
        }
      case 'Rare':
        return {
          border: 'border-blue-500',
          bg: isCompleted 
            ? 'bg-gradient-to-br from-blue-500/60 to-blue-600/60' 
            : 'bg-gradient-to-br from-blue-500/20 to-blue-600/20',
          glow: isCompleted ? 'shadow-2xl shadow-blue-500/70' : 'shadow-lg shadow-blue-500/50',
          pulse: '',
          completionRing: isCompleted ? 'ring-4 ring-blue-500/70 ring-offset-2 ring-offset-background' : '',
        }
      case 'Epic':
        return {
          border: 'border-purple-500',
          bg: isCompleted 
            ? 'bg-gradient-to-br from-purple-500/70 to-pink-500/70' 
            : 'bg-gradient-to-br from-purple-500/20 to-pink-500/20',
          glow: isCompleted ? 'shadow-2xl shadow-purple-500/80' : 'shadow-xl shadow-purple-500/50',
          pulse: '',
          completionRing: isCompleted ? 'ring-4 ring-purple-500/80 ring-offset-2 ring-offset-background' : '',
        }
      case 'Legendary':
        return {
          border: isCompleted ? 'border-yellow-400' : 'border-yellow-500',
          bg: isCompleted 
            ? 'bg-gradient-to-br from-yellow-400/70 via-orange-500/60 to-red-500/60' 
            : 'bg-gradient-to-br from-yellow-400/30 via-orange-500/20 to-red-500/20',
          glow: isCompleted ? 'shadow-2xl shadow-yellow-400/90' : 'shadow-2xl shadow-yellow-500/60',
          pulse: '',
          completionRing: isCompleted ? 'ring-4 ring-yellow-400/90 ring-offset-2 ring-offset-background' : '',
        }
      default:
        return {
          border: 'border-spirits-cyan',
          bg: isCompleted 
            ? 'bg-gradient-to-br from-spirits-cyan/40 to-spirits-magenta/40' 
            : 'bg-gradient-to-br from-spirits-cyan/20 to-spirits-magenta/20',
          glow: isCompleted ? 'shadow-lg shadow-spirits-cyan/50' : '',
          pulse: '',
          completionRing: isCompleted ? 'ring-4 ring-spirits-yellow/50 ring-offset-2 ring-offset-background' : '',
        }
    }
  }

  const rarityStyles = getRarityStyles()

  return (
    <div className="relative flex flex-col items-center gap-2">
      {/* Badge Container */}
      <div 
        className={cn(
          'relative rounded-full border-4 transition-all',
          sizeClasses[size],
          rarityStyles.border,
          rarityStyles.bg,
          rarityStyles.glow,
          rarityStyles.pulse,
          rarityStyles.completionRing,
          onClick && 'cursor-pointer active:scale-95 sm:hover:scale-105'
        )}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClick()
          }
        } : undefined}
      >
        {/* Progress Ring for progress-based achievements - Only show if not completed */}
        {achievement.requiresProgress && showProgress && !isCompleted && (
          <svg 
            className="absolute inset-0 w-full h-full transform -rotate-90"
            viewBox="0 0 100 100"
            style={{ overflow: 'visible' }}
          >
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={isUnlocked ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)'}
              strokeWidth="8"
            />
            {/* Progress circle - Always show if unlocked, fills based on percentage */}
            {isUnlocked && (
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="var(--color-spirits-cyan)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                className="transition-all duration-500"
                style={{ 
                  strokeDashoffset: `${2 * Math.PI * 45 * (1 - progressPercentage / 100)}`,
                  opacity: progressPercentage > 0 ? 1 : 0.3
                }}
              />
            )}
          </svg>
        )}

        {/* Badge Icon/Image */}
        <div className={cn(
          'absolute inset-0 flex items-center justify-center',
          !isUnlocked && 'opacity-30 grayscale'
        )}>
          {achievement.imageUrl ? (
            <>
              <img
                src={achievement.imageUrl}
                alt={achievement.name}
                className="w-full h-full object-contain p-2"
                onError={(e) => {
                  console.error('Failed to load badge image:', achievement.imageUrl, 'for achievement:', achievement.name)
                  // Hide the broken image and show fallback
                  const img = e.currentTarget
                  img.style.display = 'none'
                  const fallback = img.nextElementSibling as HTMLElement
                  if (fallback) fallback.style.display = 'flex'
                }}
              />
              {/* Fallback Award icon - hidden by default, shown on image error */}
              <Award 
                className={cn(
                  iconSizes[size],
                  isUnlocked ? 'text-spirits-cyan' : 'text-muted-foreground',
                  'hidden'
                )}
                style={{ display: 'none' }}
              />
            </>
          ) : (
            <Award className={cn(
              iconSizes[size],
              isUnlocked ? 'text-spirits-cyan' : 'text-muted-foreground'
            )} />
          )}
        </div>

        {/* Completion Checkmark - Colored by rarity */}
        {isCompleted && (
          <div className={cn(
            'absolute -bottom-1 -right-1 rounded-full p-1 border-2 border-background',
            rarity === 'Common' && 'bg-gray-400',
            rarity === 'Rare' && 'bg-blue-500',
            rarity === 'Epic' && 'bg-purple-500',
            rarity === 'Legendary' && 'bg-yellow-500',
            !['Common', 'Rare', 'Epic', 'Legendary'].includes(rarity) && 'bg-spirits-yellow'
          )}>
            <svg className="h-4 w-4 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Badge Name */}
      <div className="text-center max-w-[120px]">
        <p className={cn(
          'text-xs font-semibold truncate',
          isUnlocked ? 'text-foreground' : 'text-muted-foreground'
        )}>
          {achievement.name}
        </p>
        {/* Progress text - Only show if in progress (not completed) */}
        {achievement.requiresProgress && showProgress && isUnlocked && !isCompleted && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {progress}/{achievement.requiredCount}
          </p>
        )}
      </div>
    </div>
  )
}
