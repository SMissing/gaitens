'use client'

import { useState, useEffect } from 'react'
import { AchievementBadge } from './AchievementBadge'
import { BadgeDetailModal } from './BadgeDetailModal'
import { Award, Users, Trophy } from 'lucide-react'
import type { Achievement, UserAchievement } from '@/types/database'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface AchievementsClientProps {
  achievements: Achievement[]
  userAchievements: Map<string, UserAchievement>
  currentUserId: string
  userRole: string
}

function getAchievementTitle(percentage: number): string {
  if (percentage === 0) return 'Newbie'
  if (percentage < 25) return 'Newbie'
  if (percentage < 50) return 'Novice'
  if (percentage < 75) return 'Trooper'
  if (percentage < 100) return 'Expert'
  return 'Legend'
}

export function AchievementsClient({ 
  achievements, 
  userAchievements, 
  currentUserId,
  userRole 
}: AchievementsClientProps) {
  const router = useRouter()
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)

  const completedCount = Array.from(userAchievements.values()).filter(ua => ua.completed).length
  const totalCount = achievements.length
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const title = getAchievementTitle(percentage)


  return (
    <div className="space-y-6">
      {/* Progress Bar Section */}
      <div className="space-y-3">
        {/* Progress Bar */}
        <div className="relative w-full h-8 bg-muted/30 rounded-full overflow-hidden border border-border/30">
          <div
            className="absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out"
            style={{ 
              width: `${percentage}%`,
              backgroundColor: '#00d9ff',
              backgroundImage: 'linear-gradient(to right, #00d9ff, #ff00ff, #ffff00)',
              minWidth: percentage > 0 ? '4px' : '0',
              zIndex: 1
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <span className="text-sm font-bold text-foreground drop-shadow-lg">
              {percentage}%
            </span>
          </div>
        </div>

        {/* Title - Centered */}
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            {title}
          </h2>
        </div>
      </div>

      {/* Award Button for Managers/Admins */}
      {(userRole === 'manager' || userRole === 'admin') && (
        <div className="flex justify-center">
          <Button
            onClick={() => router.push('/achievements/award')}
            className="flex items-center gap-2"
          >
            <Award className="h-4 w-4" />
            Award Achievement
          </Button>
        </div>
      )}

      {/* Achievements Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {achievements
          .map((achievement) => {
            const userAchievement = userAchievements.get(achievement.id)
            const isCompleted = userAchievement?.completed ?? false
            const isInProgress = userAchievement && !isCompleted && userAchievement.currentProgress > 0
            
            return {
              achievement,
              userAchievement,
              // Sort priority: completed first, then in-progress, then unlocked, then locked
              sortPriority: isCompleted ? 0 : isInProgress ? 1 : userAchievement ? 2 : 3
            }
          })
          .sort((a, b) => {
            // First sort by priority
            if (a.sortPriority !== b.sortPriority) {
              return a.sortPriority - b.sortPriority
            }
            // Then by requiredCount (for streak badges: 1, 7, 30, 100)
            return a.achievement.requiredCount - b.achievement.requiredCount
          })
          .map(({ achievement, userAchievement }) => {
            return (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                userAchievement={userAchievement}
                size="md"
                showProgress={true}
                onClick={() => setSelectedAchievement(achievement)}
              />
            )
          })}
      </div>

      {/* Badge Detail Modal */}
      {selectedAchievement && (
        <BadgeDetailModal
          achievement={selectedAchievement}
          userAchievement={userAchievements.get(selectedAchievement.id)}
          isOpen={!!selectedAchievement}
          onClose={() => setSelectedAchievement(null)}
        />
      )}

      {/* Empty State */}
      {achievements.length === 0 && (
        <div className="text-center py-16">
          <Award className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-xl text-muted-foreground">No achievements available yet</p>
        </div>
      )}
    </div>
  )
}
