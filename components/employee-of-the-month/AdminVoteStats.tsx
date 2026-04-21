'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Loader2, BarChart3, Trophy, CheckCircle } from 'lucide-react'

interface VoteStat {
  nomineeId: string
  nomineeName: string
  site: string | null
  totalVotes: number
  staffVotes: number
  managerVotes: number
  votes: Array<{
    voterId: string
    voterName: string
    voterRole: string
    reason: string | null
    createdAt: string
  }>
}

interface VoteStatsData {
  month: string
  stats: VoteStat[]
  totalVotes: number
}

export function AdminVoteStats() {
  const [stats, setStats] = useState<VoteStatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [staffPickId, setStaffPickId] = useState<string>('')
  const [managerPickId, setManagerPickId] = useState<string>('')
  const [settingWinners, setSettingWinners] = useState(false)
  const [winnersSet, setWinnersSet] = useState(false)

  useEffect(() => {
    fetchStats()
    checkWinners()
  }, [])

  const checkWinners = async () => {
    try {
      const response = await fetch('/api/employee-winners')
      if (response.ok) {
        const winners = await response.json()
        const staffPick = winners.find((w: any) => w.type === 'staff_pick')
        const managerPick = winners.find((w: any) => w.type === 'manager_pick')
        if (staffPick) setStaffPickId(staffPick.userId)
        if (managerPick) setManagerPickId(managerPick.userId)
        if (staffPick || managerPick) setWinnersSet(true)
      }
    } catch (err) {
      // Ignore errors
    }
  }

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/employee-votes/stats')
      if (!response.ok) {
        throw new Error('Failed to fetch vote statistics')
      }
      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin" />
            <p>Loading vote statistics...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-500/50 bg-red-500/10">
        <CardContent className="py-12">
          <div className="text-center text-red-500">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats || stats.stats.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No votes yet for {stats?.month || 'this month'}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Find the top vote getters
  const topStaffPick = stats.stats
    .filter(s => s.staffVotes > 0)
    .sort((a, b) => b.staffVotes - a.staffVotes)[0]
  
  const topManagerPick = stats.stats
    .filter(s => s.managerVotes > 0)
    .sort((a, b) => b.managerVotes - a.managerVotes)[0]

  const handleSetWinners = async () => {
    if (!staffPickId || !managerPickId) {
      setError('Please select both staff pick and manager pick')
      return
    }

    setSettingWinners(true)
    setError(null)

    try {
      const response = await fetch('/api/employee-winners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffPickUserId: staffPickId,
          managerPickUserId: managerPickId,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to set winners')
      }

      setWinnersSet(true)
      // Refresh the page to show winners
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set winners')
    } finally {
      setSettingWinners(false)
    }
  }

  const maxVotes = Math.max(...stats.stats.map(s => s.totalVotes), 1)

  // Get staff options for dropdowns
  const staffOptions = stats.stats
    .filter(s => s.staffVotes > 0 || s.managerVotes > 0)
    .map(s => ({
      value: s.nomineeId,
      label: `${s.nomineeName} (${s.staffVotes} staff, ${s.managerVotes} manager votes)`,
    }))

  return (
    <div className="space-y-6">
      {/* Set Winners Section */}
      {!winnersSet && (
        <Card className="border-spirits-yellow/50 bg-spirits-yellow/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-spirits-yellow" />
              Select Winners
            </CardTitle>
            <CardDescription>
              Choose the staff pick and manager pick winners for this month
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Staff Pick</label>
                <Select
                  options={[
                    { value: '', label: '-- Select staff pick --' },
                    ...staffOptions,
                  ]}
                  value={staffPickId}
                  onChange={(value) => setStaffPickId(value)}
                  placeholder="Select staff pick"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Manager Pick</label>
                <Select
                  options={[
                    { value: '', label: '-- Select manager pick --' },
                    ...staffOptions,
                  ]}
                  value={managerPickId}
                  onChange={(value) => setManagerPickId(value)}
                  placeholder="Select manager pick"
                />
              </div>
            </div>
            {error && (
              <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded p-2">
                {error}
              </div>
            )}
            <Button
              onClick={handleSetWinners}
              disabled={settingWinners || !staffPickId || !managerPickId}
              className="w-full md:w-auto"
            >
              {settingWinners ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Setting Winners...
                </>
              ) : (
                <>
                  <Trophy className="h-4 w-4 mr-2" />
                  Announce Winners
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {winnersSet && (
        <Card className="border-green-500/50 bg-green-500/10">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <p className="font-medium">Winners have been announced for this month</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Votes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalVotes}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Staff Pick Leader</CardTitle>
          </CardHeader>
          <CardContent>
            {topStaffPick ? (
              <div>
                <p className="text-xl font-bold">{topStaffPick.nomineeName}</p>
                <p className="text-sm text-muted-foreground">{topStaffPick.staffVotes} staff vote(s)</p>
              </div>
            ) : (
              <p className="text-muted-foreground">No staff votes yet</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Manager Pick Leader</CardTitle>
          </CardHeader>
          <CardContent>
            {topManagerPick ? (
              <div>
                <p className="text-xl font-bold">{topManagerPick.nomineeName}</p>
                <p className="text-sm text-muted-foreground">
                  {topManagerPick.managerVotes} manager pick vote(s)
                  <span className="block text-xs mt-0.5">Includes managers and admins</span>
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">No manager pick votes yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vote Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Vote Breakdown</CardTitle>
          <CardDescription>
            Voting period: {stats.month}. Manager pick totals include votes from managers and admins.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.stats
              .filter(s => s.totalVotes > 0)
              .sort((a, b) => b.totalVotes - a.totalVotes)
              .map((stat) => (
                <div key={stat.nomineeId} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-foreground">
                        {stat.nomineeName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {stat.staffVotes} staff vote(s) • {stat.managerVotes} manager pick vote(s) •{' '}
                        {stat.totalVotes} total
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{stat.totalVotes}</p>
                    </div>
                  </div>
                  {/* Bar chart visualization */}
                  <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                    <div
                      className="h-full bg-spirits-yellow transition-all"
                      style={{ width: `${(stat.totalVotes / maxVotes) * 100}%` }}
                    />
                  </div>
                  {/* Vote details */}
                  <details className="text-sm">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                      View vote details ({stat.votes.length})
                    </summary>
                    <div className="mt-2 space-y-2 pl-4 border-l-2 border-border">
                      {stat.votes.map((vote, idx) => (
                        <div key={idx} className="py-2">
                          <p className="text-foreground">
                            <span className="font-medium">{vote.voterName}</span>
                            <span className="text-muted-foreground ml-2">
                              (
                              {vote.voterRole === 'staff'
                                ? 'Staff'
                                : vote.voterRole === 'manager'
                                  ? 'Manager'
                                  : vote.voterRole === 'admin'
                                    ? 'Admin'
                                    : vote.voterRole}
                              )
                            </span>
                          </p>
                          {vote.reason && (
                            <p className="text-muted-foreground italic mt-1">"{vote.reason}"</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
