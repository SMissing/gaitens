'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Loader2, Trophy, CheckCircle, Users } from 'lucide-react'

interface MonthSummary {
  month: string
  voteCount: number
  announced: boolean | 'partial'
}

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

interface Winner {
  id: string
  userId: string
  month: string
  type: 'staff_pick' | 'manager_pick'
  users: { id: string; name: string; site: string | null }
}

function formatMonth(month: string): string {
  const [year, monthNum] = month.split('-')
  const date = new Date(parseInt(year), parseInt(monthNum) - 1)
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

export function EotmAdminClient() {
  const [months, setMonths] = useState<MonthSummary[]>([])
  const [monthsLoading, setMonthsLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const [stats, setStats] = useState<VoteStatsData | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [winners, setWinners] = useState<Winner[]>([])
  const [staffPickId, setStaffPickId] = useState('')
  const [managerPickId, setManagerPickId] = useState('')
  const [announcing, setAnnouncing] = useState(false)
  const [announceError, setAnnounceError] = useState<string | null>(null)
  const [announceSuccess, setAnnounceSuccess] = useState(false)

  const fetchMonths = useCallback(async () => {
    try {
      const res = await fetch('/api/employee-votes/months')
      if (res.ok) {
        const data: MonthSummary[] = await res.json()
        setMonths(data)
        return data
      }
    } catch {
      // ignore
    }
    return []
  }, [])

  const fetchStatsAndWinners = useCallback(async (month: string) => {
    setStatsLoading(true)

    const [statsRes, winnersRes] = await Promise.all([
      fetch(`/api/employee-votes/stats?month=${month}`),
      fetch(`/api/employee-winners?month=${month}`),
    ])

    if (statsRes.ok) {
      setStats(await statsRes.json())
    }

    if (winnersRes.ok) {
      const data: Winner[] = await winnersRes.json()
      setWinners(data)
      const sp = data.find(w => w.type === 'staff_pick')
      const mp = data.find(w => w.type === 'manager_pick')
      setStaffPickId(sp?.userId ?? '')
      setManagerPickId(mp?.userId ?? '')
    }

    setStatsLoading(false)
  }, [])

  useEffect(() => {
    setMonthsLoading(true)
    fetchMonths().then(data => {
      setMonthsLoading(false)
      if (data.length > 0) setSelectedMonth(data[0].month)
    })
  }, [fetchMonths])

  useEffect(() => {
    if (selectedMonth) {
      setAnnounceSuccess(false)
      setAnnounceError(null)
      fetchStatsAndWinners(selectedMonth)
    }
  }, [selectedMonth, fetchStatsAndWinners])

  const handleAnnounce = async () => {
    if (!selectedMonth || !staffPickId || !managerPickId) {
      setAnnounceError('Please select both staff pick and manager pick')
      return
    }

    setAnnouncing(true)
    setAnnounceError(null)

    try {
      const res = await fetch('/api/employee-winners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffPickUserId: staffPickId,
          managerPickUserId: managerPickId,
          month: selectedMonth,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to announce winners')
      }

      setAnnounceSuccess(true)
      // Refresh months list badge + winners display without resetting success
      fetchMonths().then(data => setMonths(data))
      const winnersRes = await fetch(`/api/employee-winners?month=${selectedMonth}`)
      if (winnersRes.ok) {
        const data: Winner[] = await winnersRes.json()
        setWinners(data)
      }
    } catch (err) {
      setAnnounceError(err instanceof Error ? err.message : 'Failed to announce winners')
    } finally {
      setAnnouncing(false)
    }
  }

  if (monthsLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin" />
          <p>Loading voting history...</p>
        </CardContent>
      </Card>
    )
  }

  if (months.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No votes have been cast yet</p>
        </CardContent>
      </Card>
    )
  }

  const staffWinner = winners.find(w => w.type === 'staff_pick')
  const managerWinner = winners.find(w => w.type === 'manager_pick')
  const isAnnounced = !!(staffWinner || managerWinner)
  const isBothAnnounced = !!(staffWinner && managerWinner)

  const nomineeOptions = stats?.stats
    .filter(s => s.totalVotes > 0)
    .map(s => ({
      value: s.nomineeId,
      label: `${s.nomineeName}${s.site ? ` — ${s.site}` : ''} (${s.staffVotes} staff, ${s.managerVotes} mgr)`,
    })) ?? []

  const maxVotes = Math.max(...(stats?.stats.map(s => s.totalVotes) ?? [1]), 1)

  return (
    <div className="space-y-6">
      {/* Month selector pills */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          Voting History
        </h2>
        <div className="flex flex-wrap gap-2">
          {months.map(m => (
            <button
              key={m.month}
              onClick={() => setSelectedMonth(m.month)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all touch-manipulation
                ${selectedMonth === m.month
                  ? 'border-garrison-orange bg-garrison-orange/10 text-garrison-orange'
                  : 'border-border hover:border-garrison-orange/50 hover:bg-accent text-foreground'
                }
              `}
            >
              {formatMonth(m.month)}
              <span className={`
                text-xs px-1.5 py-0.5 rounded-full font-normal
                ${m.announced === true
                  ? 'bg-green-500/20 text-green-500'
                  : m.announced === 'partial'
                    ? 'bg-yellow-500/20 text-yellow-500'
                    : 'bg-muted text-muted-foreground'
                }
              `}>
                {m.announced === true
                  ? 'Announced'
                  : m.announced === 'partial'
                    ? 'Partial'
                    : `${m.voteCount} vote${m.voteCount !== 1 ? 's' : ''}`
                }
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected month detail */}
      {selectedMonth && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xl font-bold">{formatMonth(selectedMonth)}</h2>
            {isBothAnnounced && (
              <div className="flex items-center gap-1.5 text-green-500 text-sm font-medium">
                <CheckCircle className="h-4 w-4" />
                Winners announced
              </div>
            )}
          </div>

          {statsLoading ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Loader2 className="h-6 w-6 mx-auto mb-2 animate-spin" />
                <p>Loading...</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Announce / re-announce card */}
              <Card className={isBothAnnounced ? 'border-green-500/30' : 'border-garrison-orange/40 bg-garrison-orange/5'}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-garrison-orange" />
                    {isBothAnnounced ? 'Announced Winners' : 'Announce Winners'}
                  </CardTitle>
                  {isBothAnnounced && (
                    <CardDescription>
                      Winners have been announced. You can update the selection below.
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Current winners summary */}
                  {isAnnounced && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg bg-muted/50">
                      {staffWinner && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-0.5">Staff Pick</p>
                          <p className="font-semibold text-spirits-yellow">{staffWinner.users.name}</p>
                          {staffWinner.users.site && (
                            <p className="text-xs text-muted-foreground">{staffWinner.users.site}</p>
                          )}
                        </div>
                      )}
                      {managerWinner && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-0.5">Manager Pick</p>
                          <p className="font-semibold text-spirits-cyan">{managerWinner.users.name}</p>
                          {managerWinner.users.site && (
                            <p className="text-xs text-muted-foreground">{managerWinner.users.site}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {nomineeOptions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          {isBothAnnounced ? 'Update Staff Pick' : 'Staff Pick'}
                        </label>
                        <Select
                          options={[
                            { value: '', label: '-- Select staff pick --' },
                            ...nomineeOptions,
                          ]}
                          value={staffPickId}
                          onChange={(value) => setStaffPickId(value)}
                          placeholder="Select staff pick"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          {isBothAnnounced ? 'Update Manager Pick' : 'Manager Pick'}
                        </label>
                        <Select
                          options={[
                            { value: '', label: '-- Select manager pick --' },
                            ...nomineeOptions,
                          ]}
                          value={managerPickId}
                          onChange={(value) => setManagerPickId(value)}
                          placeholder="Select manager pick"
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No votes have been cast for this month yet.
                    </p>
                  )}

                  {announceError && (
                    <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded p-2">
                      {announceError}
                    </div>
                  )}

                  {announceSuccess && (
                    <div className="text-sm text-green-600 bg-green-500/10 border border-green-500/20 rounded p-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Winners announced successfully
                    </div>
                  )}

                  {nomineeOptions.length > 0 && (
                    <Button
                      onClick={handleAnnounce}
                      disabled={announcing || !staffPickId || !managerPickId}
                    >
                      {announcing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {isBothAnnounced ? 'Updating...' : 'Announcing...'}
                        </>
                      ) : (
                        <>
                          <Trophy className="h-4 w-4 mr-2" />
                          {isBothAnnounced ? 'Update Winners' : 'Announce Winners'}
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Full vote breakdown */}
              {stats && stats.totalVotes > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Vote Breakdown</CardTitle>
                    <CardDescription>
                      {stats.totalVotes} vote{stats.totalVotes !== 1 ? 's' : ''} cast · all nominations and reasons shown below
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      {stats.stats
                        .filter(s => s.totalVotes > 0)
                        .sort((a, b) => b.totalVotes - a.totalVotes)
                        .map(stat => (
                          <div key={stat.nomineeId}>
                            <div className="flex justify-between items-start mb-1">
                              <div>
                                <p className="font-semibold text-foreground">{stat.nomineeName}</p>
                                {stat.site && (
                                  <p className="text-xs text-muted-foreground">{stat.site}</p>
                                )}
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {stat.staffVotes} staff vote{stat.staffVotes !== 1 ? 's' : ''} &middot;{' '}
                                  {stat.managerVotes} manager/admin vote{stat.managerVotes !== 1 ? 's' : ''} &middot;{' '}
                                  {stat.totalVotes} total
                                </p>
                              </div>
                              <p className="text-2xl font-bold text-foreground">{stat.totalVotes}</p>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2 overflow-hidden mb-4">
                              <div
                                className="h-full bg-garrison-orange/60 transition-all"
                                style={{ width: `${(stat.totalVotes / maxVotes) * 100}%` }}
                              />
                            </div>
                            {/* All individual votes with reasons */}
                            <div className="space-y-2">
                              {stat.votes.map((vote, idx) => (
                                <div key={idx} className="pl-3 border-l-2 border-border py-1.5">
                                  <p className="text-sm font-medium text-foreground">
                                    {vote.voterName}
                                    <span className="font-normal text-muted-foreground text-xs ml-1.5">
                                      ({vote.voterRole === 'staff' ? 'Staff' : vote.voterRole === 'manager' ? 'Manager' : 'Admin'})
                                    </span>
                                  </p>
                                  {vote.reason ? (
                                    <p className="text-sm text-muted-foreground italic mt-0.5">
                                      &ldquo;{vote.reason}&rdquo;
                                    </p>
                                  ) : (
                                    <p className="text-xs text-muted-foreground/50 mt-0.5">No reason given</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {stats && stats.totalVotes === 0 && (
                <Card>
                  <CardContent className="py-10 text-center text-muted-foreground">
                    <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
                    <p>No votes have been cast for this month</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
