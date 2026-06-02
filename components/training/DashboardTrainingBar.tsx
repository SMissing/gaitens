'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { GraduationCap, ChevronRight } from 'lucide-react'

interface TrainingStats {
  total: number
  completed: number
  mandatory: number
  mandatoryCompleted: number
}

export function DashboardTrainingBar() {
  const [stats, setStats] = useState<TrainingStats | null>(null)

  useEffect(() => {
    fetch('/api/training')
      .then(r => r.ok ? r.json() : null)
      .then((courses: any) => {
        if (!Array.isArray(courses)) return
        setStats({
          total: courses.length,
          completed: courses.filter((c: any) => c.completed).length,
          mandatory: courses.filter((c: any) => c.required).length,
          mandatoryCompleted: courses.filter((c: any) => c.required && c.completed).length,
        })
      })
      .catch(() => {})
  }, [])

  if (!stats || stats.total === 0) return null
  if (stats.mandatory > 0 && stats.mandatoryCompleted >= stats.mandatory) return null

  const completedPct = (stats.completed / stats.total) * 100
  const mandatoryPct = stats.mandatory > 0 ? (stats.mandatory / stats.total) * 100 : 0
  const showTick = stats.mandatory > 0 && stats.mandatory < stats.total

  return (
    <Link href="/training" className="block group">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-spirits-cyan flex-shrink-0" />
          <span className="text-sm font-medium text-foreground">Training</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">
            {stats.completed}/{stats.total} complete
          </span>
          <ChevronRight className="h-4 w-4 text-spirits-cyan opacity-60 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Same structure as the working training page progress bar */}
      <div className="relative w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full bg-spirits-cyan rounded-full transition-all duration-500"
          style={{ width: `${completedPct}%` }}
        />
        {showTick && (
          <div
            className="absolute inset-y-0 w-0.5 bg-spirits-yellow"
            style={{ left: `${mandatoryPct}%` }}
          />
        )}
      </div>
    </Link>
  )
}
