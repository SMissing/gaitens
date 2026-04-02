'use client'

import { useCallback, useEffect, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { AchievementsClient } from '@/components/achievements/AchievementsClient'
import {
  AchievementsViewToggle,
  type AchievementsViewMode,
} from '@/components/achievements/AchievementsViewToggle'
import { Award } from 'lucide-react'
import type { Achievement, UserAchievement } from '@/types/database'

const VIEW_MODE_STORAGE_KEY = 'achievements-view-mode'

interface AchievementsShellProps {
  achievements: Achievement[]
  userAchievements: Map<string, UserAchievement>
}

export function AchievementsShell({ achievements, userAchievements }: AchievementsShellProps) {
  const [viewMode, setViewMode] = useState<AchievementsViewMode>('grid')

  useEffect(() => {
    try {
      const stored = localStorage.getItem(VIEW_MODE_STORAGE_KEY)
      if (stored === 'grid' || stored === 'list') {
        setViewMode(stored)
      }
    } catch {
      /* ignore */
    }
  }, [])

  const setViewModePersisted = useCallback((mode: AchievementsViewMode) => {
    setViewMode(mode)
    try {
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode)
    } catch {
      /* ignore */
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Achievements"
        icon={<Award className="h-6 w-6 text-spirits-cyan" />}
        description="Your badges and accomplishments"
        showBack={true}
        backHref="/dashboard"
        rightSlot={
          <AchievementsViewToggle
            mode={viewMode}
            onChange={setViewModePersisted}
            disabled={achievements.length === 0}
          />
        }
      />
      <div className="p-4 sm:p-6 lg:p-8 pb-32">
        <div className="max-w-7xl mx-auto">
          <AchievementsClient achievements={achievements} userAchievements={userAchievements} viewMode={viewMode} />
        </div>
      </div>
    </div>
  )
}
