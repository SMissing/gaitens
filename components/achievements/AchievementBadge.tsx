'use client'

import { cn } from '@/lib/utils'
import type { Achievement, UserAchievement } from '@/types/database'
import { Award } from 'lucide-react'

interface AchievementBadgeProps {
  achievement: Achievement
  userAchievement?: UserAchievement
  size?: '2xs' | 'xs' | 'sm' | 'md' | 'lg'
  showProgress?: boolean
  /** When false, only the circular badge (no title under) — for compact strips */
  showLabel?: boolean
  /** When false, hide completed checkmark (and completion ring) — e.g. manager staff list */
  showCompletionMark?: boolean
  onClick?: () => void
}

export function AchievementBadge({ 
  achievement, 
  userAchievement, 
  size = 'md',
  showProgress = true,
  showLabel = true,
  showCompletionMark = true,
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
    '2xs': 'w-8 h-8',
    xs: 'w-12 h-12',
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  }

  const iconSizes = {
    '2xs': 'h-3 w-3',
    xs: 'h-5 w-5',
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  }

  const is2xs = size === '2xs'
  const isXs = size === 'xs'
  const imgPad = is2xs ? 'p-0.5' : isXs ? 'p-1' : 'p-2'

  const ringClass = is2xs ? 'ring-1 ring-offset-0' : isXs ? 'ring-2 ring-offset-1' : 'ring-4 ring-offset-2'

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
          completionRing:
            isCompleted && showCompletionMark
              ? cn('ring-gray-400/70 ring-offset-background', ringClass)
              : '',
        }
      case 'Rare':
        return {
          border: 'border-blue-500',
          bg: isCompleted 
            ? 'bg-gradient-to-br from-blue-500/60 to-blue-600/60' 
            : 'bg-gradient-to-br from-blue-500/20 to-blue-600/20',
          glow: isCompleted ? 'shadow-2xl shadow-blue-500/70' : 'shadow-lg shadow-blue-500/50',
          pulse: '',
          completionRing:
            isCompleted && showCompletionMark
              ? cn('ring-blue-500/70 ring-offset-background', ringClass)
              : '',
        }
      case 'Epic':
        return {
          border: 'border-purple-500',
          bg: isCompleted 
            ? 'bg-gradient-to-br from-purple-500/70 to-pink-500/70' 
            : 'bg-gradient-to-br from-purple-500/20 to-pink-500/20',
          glow: isCompleted ? 'shadow-2xl shadow-purple-500/80' : 'shadow-xl shadow-purple-500/50',
          pulse: '',
          completionRing:
            isCompleted && showCompletionMark
              ? cn('ring-purple-500/80 ring-offset-background', ringClass)
              : '',
        }
      case 'Legendary':
        return {
          border: isCompleted ? 'border-yellow-400' : 'border-yellow-500',
          bg: isCompleted 
            ? 'bg-gradient-to-br from-yellow-400/70 via-orange-500/60 to-red-500/60' 
            : 'bg-gradient-to-br from-yellow-400/30 via-orange-500/20 to-red-500/20',
          glow: isCompleted ? 'shadow-2xl shadow-yellow-400/90' : 'shadow-2xl shadow-yellow-500/60',
          pulse: '',
          completionRing:
            isCompleted && showCompletionMark
              ? cn('ring-yellow-400/90 ring-offset-background', ringClass)
              : '',
        }
      default:
        return {
          border: 'border-spirits-cyan',
          bg: isCompleted 
            ? 'bg-gradient-to-br from-spirits-cyan/40 to-spirits-magenta/40' 
            : 'bg-gradient-to-br from-spirits-cyan/20 to-spirits-magenta/20',
          glow: isCompleted ? 'shadow-lg shadow-spirits-cyan/50' : '',
          pulse: '',
          completionRing:
            isCompleted && showCompletionMark
              ? cn('ring-spirits-yellow/50 ring-offset-background', ringClass)
              : '',
        }
    }
  }

  const rarityStyles = getRarityStyles()

  return (
    <div className={cn('relative flex flex-col items-center', showLabel ? 'gap-2' : 'gap-0')}>
      {/* Badge Container */}
      <div 
        className={cn(
          'relative rounded-full transition-all',
          is2xs || isXs ? 'border-2' : 'border-4',
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
                className={cn('h-full w-full object-contain', imgPad)}
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
        {isCompleted && showCompletionMark && (
          <div className={cn(
            'absolute rounded-full border-2 border-background',
            isXs ? '-bottom-0.5 -right-0.5 p-0.5' : '-bottom-1 -right-1 p-1',
            rarity === 'Common' && 'bg-gray-400',
            rarity === 'Rare' && 'bg-blue-500',
            rarity === 'Epic' && 'bg-purple-500',
            rarity === 'Legendary' && 'bg-yellow-500',
            !['Common', 'Rare', 'Epic', 'Legendary'].includes(rarity) && 'bg-spirits-yellow'
          )}>
            <svg
              className={cn('text-background', isXs ? 'h-3 w-3' : 'h-4 w-4')}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Badge Name */}
      {showLabel && (
        <div className="max-w-[120px] text-center">
          <p className={cn(
            'text-xs font-semibold truncate',
            isUnlocked ? 'text-foreground' : 'text-muted-foreground'
          )}>
            {achievement.name}
          </p>
          {achievement.requiresProgress && showProgress && isUnlocked && !isCompleted && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {progress}/{achievement.requiredCount}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
