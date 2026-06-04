'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AchievementBadge } from './AchievementBadge'
import type { Achievement, UserAchievement } from '@/types/database'
import { cn } from '@/lib/utils'

interface AchievementNotificationProps {
  achievement: Achievement
  userAchievement: UserAchievement
  onClose: () => void
  queueLength?: number
  queuePosition?: number
  onSkipAll?: () => void
}

type AnimationPhase =
  | 'initial' // Full sealed pack, full screen
  | 'enlarging' // Pack enlarges and moves down
  | 'revealing' // Sealed pack fades out, revealing ripped images behind
  | 'ripping' // Top part ripping off
  | 'badgeFlying' // Badge flying out
  | 'badgeLanded' // Badge in final position
  | 'textVisible' // Text faded in

export function AchievementNotification({
  achievement,
  userAchievement,
  onClose,
  queueLength = 1,
  queuePosition = 1,
  onSkipAll,
}: AchievementNotificationProps) {
  const [phase, setPhase] = useState<AnimationPhase>('initial')
  const [mounted, setMounted] = useState(false)
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  const skipToEnd = () => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
    setPhase('textVisible')
  }

  useEffect(() => {
    if (!mounted) return

    const timeline = [
      { delay: 1200, phase: 'enlarging' as AnimationPhase },
      { delay: 2200, phase: 'revealing' as AnimationPhase },
      { delay: 2600, phase: 'ripping' as AnimationPhase },
      { delay: 3400, phase: 'badgeFlying' as AnimationPhase },
      { delay: 4600, phase: 'badgeLanded' as AnimationPhase },
      { delay: 5400, phase: 'textVisible' as AnimationPhase },
    ]

    timeoutsRef.current = timeline.map(({ delay, phase }) =>
      setTimeout(() => setPhase(phase), delay),
    )

    return () => {
      timeoutsRef.current.forEach(clearTimeout)
    }
  }, [mounted])

  const isCompleted = userAchievement.completed
  const progressPercentage = achievement.requiresProgress 
    ? Math.min((userAchievement.currentProgress / achievement.requiredCount) * 100, 100)
    : 100
  
  // Get rarity
  const rawRarity = achievement.rarity || (achievement as any).rarity || null
  const rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' = 
    (rawRarity && typeof rawRarity === 'string' && ['Common', 'Rare', 'Epic', 'Legendary'].includes(rawRarity)) 
      ? rawRarity as 'Common' | 'Rare' | 'Epic' | 'Legendary'
      : 'Common'

  // Rarity-based effects for notification
  const getRarityNotificationStyles = () => {
    switch (rarity) {
      case 'Rare':
        return {
          glow: 'shadow-2xl shadow-blue-500/50',
          titleColor: 'text-blue-400',
        }
      case 'Epic':
        return {
          glow: 'shadow-2xl shadow-purple-500/50',
          titleColor: 'text-purple-400',
        }
      case 'Legendary':
        return {
          glow: 'shadow-2xl shadow-yellow-500/60',
          titleColor: 'text-yellow-400',
        }
      default:
        return {
          glow: '',
          titleColor: 'text-foreground',
        }
    }
  }

  const rarityStyles = getRarityNotificationStyles()

  if (!mounted) return null

  // Sealed pack fades out to reveal ripped images behind
  // Always keep it rendered to maintain container size, just control opacity
  const sealedPackOpacity = phase === 'revealing' || phase === 'ripping' || phase === 'badgeFlying' || phase === 'badgeLanded' || phase === 'textVisible' ? 0 : 1
  const sealedPackTransition = phase === 'revealing' ? 'opacity 0.2s ease-out' : 'none'
  
  // Ripped images are always rendered behind sealed pack, become visible when sealed fades out
  // Bottom rip stays visible throughout after revealing
  const showBottomRip = phase === 'revealing' || phase === 'ripping' || phase === 'badgeFlying' || phase === 'badgeLanded' || phase === 'textVisible'
  // Top rip is visible during revealing and ripping phases
  const showTopRip = phase === 'revealing' || phase === 'ripping'
  const showBadge = phase === 'badgeFlying' || phase === 'badgeLanded' || phase === 'textVisible'
  const showText = phase === 'textVisible'

  // Calculate pack position and size
  // Start: full screen centered (scale ~1), then enlarge slightly (scale ~1.2) and move down (~300px) so half is off screen
  const packScale = phase === 'initial' ? 1 : 1.2 // Enlarge moderately
  const packTranslateY = phase === 'initial' ? 0 : 300 // Move down so half is off screen
  const packTransition = phase === 'enlarging' ? 'all 1s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'

  // Badge position during flight
  // Badge starts behind the bottom pack (at pack's final position), then flies up to final position
  const badgeStartY = 300 // Start at pack's final position (after it moved down)
  const badgeEndY = 0 // Final position (centered)
  const badgeTranslateY = phase === 'badgeFlying' 
    ? badgeStartY - (badgeStartY - badgeEndY) * 0.5 // Mid-flight
    : phase === 'badgeLanded' || phase === 'textVisible'
    ? badgeEndY
    : badgeStartY
  const badgeOpacity = phase === 'badgeFlying' || phase === 'badgeLanded' || phase === 'textVisible' ? 1 : 0
  const badgeScale = phase === 'badgeFlying' ? 0.7 : phase === 'badgeLanded' || phase === 'textVisible' ? 1 : 0.7
  const badgeTransition = phase === 'badgeFlying' 
    ? 'all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' // Bounce effect
    : 'all 0.5s ease-out'

  // Top rip animation
  const topRipTranslateY = phase === 'ripping' ? -300 : 0
  const topRipOpacity = phase === 'ripping' ? 0 : 1
  const topRipTransition = phase === 'ripping' ? 'all 0.8s ease-out' : 'none'

  // Text fade in
  const textOpacity = showText ? 1 : 0
  const textTransition = showText ? 'opacity 0.5s ease-in' : 'none'

  const modalContent = (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/95 backdrop-blur-md"
      style={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 0,
        overflow: 'hidden',
      }}
      onClick={showText ? onClose : undefined}
    >
      {/* Skip button — always visible */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          skipToEnd()
        }}
        className="absolute right-4 top-4 z-30 rounded-lg px-3 py-1.5 text-xs font-semibold text-white/60 transition-colors active:text-white sm:hover:text-white"
        style={{ paddingTop: 'calc(0.375rem + env(safe-area-inset-top, 0px))' }}
        aria-label="Skip animation"
      >
        Skip
      </button>

      {/* Queue counter — shown when more than one badge */}
      {queueLength > 1 && (
        <div
          className="absolute left-4 top-4 z-30 rounded-lg px-2 py-1 text-xs font-semibold text-white/50"
          style={{ paddingTop: 'calc(0.25rem + env(safe-area-inset-top, 0px))' }}
        >
          {queuePosition} of {queueLength}
        </div>
      )}

      <div
        className="relative w-full h-full flex flex-col items-center justify-center px-4"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
        onClick={showText ? onClose : undefined}
      >
        {/* Card Pack Container */}
        <div 
          className="absolute"
          style={{
            transform: `translate(-50%, calc(-50% + ${packTranslateY}px)) scale(${packScale})`,
            transition: packTransition,
            zIndex: 10,
            top: '50%',
            left: '50%',
            transformOrigin: 'center center',
            maxWidth: '100vw',
            maxHeight: '100vh',
            overflow: 'visible',
          }}
        >
          {/* Wrapper to maintain container size */}
          <div className="relative inline-block">
            {/* Ripped Pack - Bottom Part - Always rendered behind sealed pack */}
            <img
              src="/CardPack/GaitensCardPack_BottomRip.png"
              alt="Card Pack Bottom"
              className="w-auto h-auto max-w-[90vw] max-h-[90vh] object-contain"
              style={{
                display: 'block',
                position: 'absolute',
                top: 0,
                left: 0,
                opacity: showBottomRip ? 1 : 0,
                zIndex: 9, // Behind sealed pack
              }}
            />

            {/* Ripped Pack - Top Part - Always rendered behind sealed pack */}
            <img
              src="/CardPack/GaitensCardPack_TopRip.png"
              alt="Card Pack Top"
              className="w-auto h-auto max-w-[90vw] max-h-[90vh] object-contain"
              style={{
                display: 'block',
                position: 'absolute',
                top: 0,
                left: 0,
                transform: `translateY(${topRipTranslateY}px)`,
                opacity: showTopRip ? topRipOpacity : 0,
                transition: topRipTransition,
                zIndex: 10, // Behind sealed pack
              }}
            />

            {/* Sealed Pack - Always rendered, fades out to reveal ripped images behind */}
            <img
              src="/CardPack/GaitensCardPack.png"
              alt="Card Pack"
              className="w-auto h-auto max-w-[90vw] max-h-[90vh] object-contain"
              style={{
                display: 'block',
                position: 'relative',
                width: 'auto',
                height: 'auto',
                opacity: sealedPackOpacity,
                transition: sealedPackTransition,
                zIndex: 11, // Above ripped images
                pointerEvents: sealedPackOpacity === 0 ? 'none' : 'auto', // Disable interaction when invisible
              }}
            />
          </div>
        </div>

        {/* Content Container - Positioned where badge should land, moved up to avoid overlap */}
        <div 
          className="flex flex-col items-center text-center space-y-8 sm:space-y-10 lg:space-y-12 w-full max-w-md relative z-20"
          style={{
            marginTop: '-300px', // Move content up more to avoid overlapping with bottom pack
          }}
        >
          {/* Title - Above badge */}
          <div 
            className="space-y-3 w-full"
            style={{
              opacity: textOpacity,
              transition: textTransition,
            }}
          >
            <h2 className={cn(
              "text-2xl sm:text-3xl lg:text-4xl font-bold",
              rarityStyles.titleColor
            )}>
              {rarity === 'Legendary' && '🌟 '}
              {rarity === 'Epic' && '✨ '}
              Achievement Unlocked!
              {rarity === 'Epic' && ' ✨'}
              {rarity === 'Legendary' && ' 🌟'}
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground">
              You've been awarded
            </p>
          </div>

          {/* Badge Container - Flies out from pack */}
          <div 
            className="relative flex flex-col items-center flex-shrink-0"
            style={{
              transform: `translateY(${badgeTranslateY}px) scale(${badgeScale})`,
              opacity: badgeOpacity,
              transition: badgeTransition,
            }}
          >
            {/* Badge Circle Container */}
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 flex items-center justify-center">
              {/* Badge */}
              <div className={cn(
                'relative rounded-full border-4 transition-all',
                'w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48',
                // Rarity-based colors
                rarity === 'Common' && (isCompleted 
                  ? 'border-gray-400 bg-gradient-to-br from-gray-400/60 to-gray-500/60 shadow-lg shadow-gray-400/50' 
                  : 'border-gray-400 bg-gradient-to-br from-gray-400/20 to-gray-500/20'),
                rarity === 'Rare' && (isCompleted 
                  ? 'border-blue-500 bg-gradient-to-br from-blue-500/60 to-blue-600/60 shadow-2xl shadow-blue-500/70' 
                  : 'border-blue-500 bg-gradient-to-br from-blue-500/20 to-blue-600/20 shadow-lg shadow-blue-500/50'),
                rarity === 'Epic' && (isCompleted 
                  ? 'border-purple-500 bg-gradient-to-br from-purple-500/70 to-pink-500/70 shadow-2xl shadow-purple-500/80' 
                  : 'border-purple-500 bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-xl shadow-purple-500/50'),
                rarity === 'Legendary' && (isCompleted 
                  ? 'border-yellow-400 bg-gradient-to-br from-yellow-400/70 via-orange-500/60 to-red-500/60 shadow-2xl shadow-yellow-400/90' 
                  : 'border-yellow-500 bg-gradient-to-br from-yellow-400/30 via-orange-500/20 to-red-500/20 shadow-2xl shadow-yellow-500/60'),
                !['Common', 'Rare', 'Epic', 'Legendary'].includes(rarity) && (isCompleted 
                  ? 'border-spirits-cyan bg-gradient-to-br from-spirits-cyan/60 to-spirits-magenta/60 shadow-lg shadow-spirits-cyan/50' 
                  : 'border-spirits-cyan bg-gradient-to-br from-spirits-cyan/20 to-spirits-magenta/20'),
                // Completion ring
                isCompleted && rarity === 'Common' && 'ring-4 ring-gray-400/70 ring-offset-2 ring-offset-background',
                isCompleted && rarity === 'Rare' && 'ring-4 ring-blue-500/70 ring-offset-2 ring-offset-background',
                isCompleted && rarity === 'Epic' && 'ring-4 ring-purple-500/80 ring-offset-2 ring-offset-background',
                isCompleted && rarity === 'Legendary' && 'ring-4 ring-yellow-400/90 ring-offset-2 ring-offset-background',
                isCompleted && !['Common', 'Rare', 'Epic', 'Legendary'].includes(rarity) && 'ring-4 ring-spirits-yellow/50 ring-offset-2 ring-offset-background'
              )}>
                {/* Progress Ring for progress-based achievements */}
                {achievement.requiresProgress && (
                  <svg 
                    className="absolute inset-0 w-full h-full transform -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="rgba(0, 0, 0, 0.2)"
                      strokeWidth="8"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke={isCompleted ? '#FCD34D' : '#06B6D4'}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressPercentage / 100)}`}
                      className="transition-all duration-500"
                    />
                  </svg>
                )}

                {/* Badge Icon/Image */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {achievement.imageUrl ? (
                    <img
                      src={achievement.imageUrl}
                      alt={achievement.name}
                      className="w-full h-full object-contain p-2"
                      onError={(e) => {
                        console.error('Failed to load badge image:', achievement.imageUrl, 'for achievement:', achievement.name)
                        const img = e.currentTarget
                        img.style.display = 'none'
                        const fallback = img.nextElementSibling as HTMLElement
                        if (fallback) fallback.style.display = 'flex'
                      }}
                    />
                  ) : (
                    <div className="h-16 w-16 sm:h-20 sm:w-20 text-spirits-cyan">
                      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Completion Checkmark */}
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
            </div>
          </div>

          {/* Achievement Name and Description - Fade in */}
          <div
            className="space-y-3 w-full"
            style={{
              opacity: textOpacity,
              transition: textTransition,
            }}
          >
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
              {achievement.name}
            </h3>
            {achievement.description && (
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground px-2">
                {achievement.description}
              </p>
            )}
            {achievement.requiresProgress && !isCompleted && (
              <p className="text-sm sm:text-base lg:text-lg text-spirits-cyan font-semibold mt-4">
                Progress: {userAchievement.currentProgress} / {achievement.requiredCount}
              </p>
            )}
            {isCompleted && (
              <p className="text-sm sm:text-base lg:text-lg text-spirits-yellow font-semibold mt-4">
                ✓ Completed!
              </p>
            )}
          </div>

          {/* Bottom actions — fade in with text */}
          <div
            className="flex flex-col items-center gap-3 w-full pt-2"
            style={{ opacity: textOpacity, transition: textTransition }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs text-white/40 animate-pulse">Tap anywhere to continue</p>
            {queueLength > 1 && onSkipAll && (
              <button
                type="button"
                onClick={onSkipAll}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white/50 transition-colors active:text-white sm:hover:text-white"
              >
                Skip all {queueLength} badges →
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
