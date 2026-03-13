'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Award, CheckCircle2, AlertCircle } from 'lucide-react'
import type { Achievement, User } from '@/types/database'

interface AwardAchievementFormProps {
  achievements: Achievement[]
  users: User[]
}

export function AwardAchievementForm({ achievements, users }: AwardAchievementFormProps) {
  const router = useRouter()
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [selectedAchievementId, setSelectedAchievementId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (!selectedUserId || !selectedAchievementId) {
      setError('Please select both a user and an achievement')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/achievements/award', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUserId,
          achievementId: selectedAchievementId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to award achievement')
      }

      const selectedUser = users.find(u => u.id === selectedUserId)
      const selectedAchievement = achievements.find(a => a.id === selectedAchievementId)
      setSuccess(`Achievement "${selectedAchievement?.name}" awarded to ${selectedUser?.name}!`)
      
      // Reset form
      setSelectedUserId('')
      setSelectedAchievementId('')
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/achievements')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-card/60 backdrop-blur-md rounded-2xl border border-border/30 shadow-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-spirits-cyan/20 rounded-xl">
            <Award className="h-6 w-6 text-spirits-cyan" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Award Achievement</h2>
        </div>

        {/* User Selection */}
        <div className="space-y-2">
          <label htmlFor="user" className="text-sm font-semibold text-foreground">
            Select Staff Member
          </label>
          <Select
            id="user"
            value={selectedUserId}
            onChange={(value) => setSelectedUserId(value)}
            placeholder="Choose a staff member..."
            disabled={loading}
            options={users.map((user) => ({
              value: user.id,
              label: `${user.name} (${user.staffCode})`,
            }))}
          />
        </div>

        {/* Achievement Selection */}
        <div className="space-y-2">
          <label htmlFor="achievement" className="text-sm font-semibold text-foreground">
            Select Achievement
          </label>
          <Select
            id="achievement"
            value={selectedAchievementId}
            onChange={(value) => setSelectedAchievementId(value)}
            placeholder="Choose an achievement..."
            disabled={loading}
            options={achievements.map((achievement) => ({
              value: achievement.id,
              label: achievement.requiresProgress 
                ? `${achievement.name} (${achievement.requiredCount} required)`
                : achievement.name,
            }))}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-destructive/20 border border-destructive/50 rounded-xl text-destructive-foreground flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-500 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={loading || !selectedUserId || !selectedAchievementId}
            className="flex-1"
          >
            <Award className="h-4 w-4" />
            {loading ? 'Awarding...' : 'Award Achievement'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/achievements')}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}
