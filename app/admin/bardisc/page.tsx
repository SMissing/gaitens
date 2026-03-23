import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { PageHeader } from '@/components/layout/PageHeader'
import { formatDate } from '@/lib/date-utils'
import { FileWarning } from 'lucide-react'

type BarDisclaimerUserRow = {
  id: string
  name: string
  role: string
  barredDisclaimerAcceptCount?: number | null
  barredDisclaimerLastAcceptedAt?: string | null
}

export default async function AdminBarDiscPage() {
  await requireAdmin()

  const supabase = createServerClient()

  const { data: rows, error } = await supabase
    .from('users')
    .select('id, name, role, barredDisclaimerAcceptCount, barredDisclaimerLastAcceptedAt')
    .in('role', ['manager', 'admin'])
    .order('name', { ascending: true })

  const users = (rows || []) as BarDisclaimerUserRow[]

  if (error) {
    console.error('Error fetching bar disclaimer stats:', error)
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Barred Disclaimers"
        icon={<FileWarning className="h-6 w-6 text-garrison-orange" />}
        description="Managers & admins — each time they accepted the Barred List terms before viewing the list"
        showBack={true}
        backHref="/dashboard"
      />
      <div className="p-4 sm:p-6 lg:p-8 pb-32">
        <div className="max-w-3xl mx-auto space-y-4">
          {error && (
            <div className="p-4 rounded-2xl border border-destructive/40 bg-destructive/10 text-sm text-destructive">
              Could not load user data. If you recently added tracking columns, run{' '}
              <code className="text-xs">scripts/55-add-barred-disclaimer-accept-tracking.sql</code>{' '}
              in Supabase.
            </div>
          )}

          <div className="rounded-2xl border border-border/50 overflow-hidden bg-card/40">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30 text-left">
                    <th className="p-3 sm:p-4 font-semibold text-foreground">Name</th>
                    <th className="p-3 sm:p-4 font-semibold text-foreground">Role</th>
                    <th className="p-3 sm:p-4 font-semibold text-foreground text-right">
                      Acceptances
                    </th>
                    <th className="p-3 sm:p-4 font-semibold text-foreground">Last accepted</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-muted-foreground">
                        No managers or admins found.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => {
                      const count =
                        typeof u.barredDisclaimerAcceptCount === 'number'
                          ? u.barredDisclaimerAcceptCount
                          : 0
                      const last = u.barredDisclaimerLastAcceptedAt
                      return (
                        <tr
                          key={u.id}
                          className="border-b border-border/30 last:border-0 hover:bg-muted/20"
                        >
                          <td className="p-3 sm:p-4 font-medium text-foreground">{u.name}</td>
                          <td className="p-3 sm:p-4 capitalize text-muted-foreground">{u.role}</td>
                          <td className="p-3 sm:p-4 text-right font-semibold tabular-nums text-foreground">
                            {count}
                          </td>
                          <td className="p-3 sm:p-4 text-muted-foreground whitespace-nowrap">
                            {last ? formatDate(last) : '—'}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
