import Link from 'next/link'
import { createServerClient } from '@/lib/db'
import { formatDate } from '@/lib/date-utils'
import type { User } from '@/types/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dock, DockItem, DockIcon, DockLabel, DockAccordion, DockIconCircle } from '@/components/core/dock'
import { DockExpansion } from './DockExpansion'
import { NoticeBoardCard } from '@/components/notices/NoticeBoardCard'
import {
  BookOpen,
  Calendar,
  GraduationCap,
  MessageSquare,
  Lightbulb,
  FileText,
  Award,
  Building2,
  Users,
  Briefcase,
} from 'lucide-react'

interface DashboardContentProps {
  user: User
}

export default async function DashboardContent({ user }: DashboardContentProps) {
  const supabase = createServerClient()

  // Fetch dashboard data
  // Training completions (due soon)
  const { data: trainingCompletions } = await supabase
    .from('training_completions')
    .select('*, training_courses(*)')
    .eq('userId', user.id)
    .order('expiresAt', { ascending: true })
    .limit(5)

  // Pending holiday requests
  const { data: holidayRequests } = await supabase
    .from('holiday_requests')
    .select('*')
    .eq('userId', user.id)
    .eq('status', 'pending')
    .order('createdAt', { ascending: false })
    .limit(5)

  // Pinned notices only for dashboard
  const { data: notices } = await supabase
    .from('notices')
    .select('*')
    .eq('pinned', true)
    .or('expiresAt.is.null,expiresAt.gt.' + new Date().toISOString())
    .order('createdAt', { ascending: false })

  // Employee of the month winner
  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
  const { data: winner } = await supabase
    .from('employee_winners')
    .select('*, users(*)')
    .eq('month', currentMonth)
    .single()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-48 sm:pb-40 relative z-10">
      {/* Welcome Message */}
      <div className="mb-8">
        <p className="text-muted-foreground text-lg">Welcome back, {user.name}</p>
      </div>

      {/* Notice Board - Prominent Card */}
      <div className="mb-8">
        <NoticeBoardCard notices={notices || []} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardDescription>Training Status</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {trainingCompletions?.filter(t => {
                const expiresAt = new Date(t.expiresAt)
                const daysUntilExpiry = (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                return daysUntilExpiry <= 30 && daysUntilExpiry > 0
              }).length || 0} Due Soon
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Pending Holidays</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {holidayRequests?.length || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Employee of the Month */}
      {winner && (
        <div className="relative bg-gradient-to-r from-spirits-yellow/20 to-spirits-yellow-dark/20 backdrop-blur-md rounded-lg shadow-xl p-6 mb-8 border border-spirits-yellow/50 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-spirits-yellow/10 via-transparent to-spirits-yellow-dark/10"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-foreground mb-2 tracking-tight">Employee of the Month</h2>
            <p className="text-lg text-foreground">
              Congratulations to <span className="font-bold text-spirits-yellow">{(winner.users as any)?.name}</span>!
            </p>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Training Status */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Training Status</CardTitle>
              <Link
                href="/training"
                className="text-spirits-cyan hover:text-spirits-cyan-dark text-sm font-semibold transition-all hover:underline"
              >
                View All →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
          {trainingCompletions && trainingCompletions.length > 0 ? (
            <ul className="space-y-3">
              {trainingCompletions.map((completion: any) => {
                const expiresAt = new Date(completion.expiresAt)
                const daysUntilExpiry = Math.ceil(
                  (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                )
                return (
                  <li key={completion.id} className="flex justify-between items-center">
                    <span className="text-card-foreground">
                      {completion.training_courses?.title || 'Unknown Course'}
                    </span>
                    {daysUntilExpiry <= 30 && daysUntilExpiry > 0 ? (
                      <span className="text-garrison-orange text-sm font-medium">
                        Expires in {daysUntilExpiry} days
                      </span>
                    ) : daysUntilExpiry <= 0 ? (
                      <span className="text-destructive text-sm font-medium">Expired</span>
                    ) : (
                      <span className="text-bassment-green text-sm">Valid</span>
                    )}
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="text-muted-foreground">No training records found.</p>
          )}
          </CardContent>
        </Card>

        {/* Holiday Requests */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Holiday Requests</CardTitle>
              <Link
                href="/holidays"
                className="text-spirits-cyan hover:text-spirits-cyan-dark text-sm font-semibold transition-all hover:underline"
              >
                View All →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
          {holidayRequests && holidayRequests.length > 0 ? (
            <ul className="space-y-3">
              {holidayRequests.map((request: any) => (
                <li key={request.id} className="flex justify-between items-center">
                  <div>
                    <span className="text-card-foreground">
                      {formatDate(request.startDate)} - {formatDate(request.endDate)}
                    </span>
                  </div>
                  <span className="px-2 py-1 bg-spirits-yellow/20 text-spirits-yellow text-xs font-medium rounded border border-spirits-yellow/30">
                    Pending
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No pending holiday requests.</p>
          )}
          </CardContent>
        </Card>

      </div>

      {/* Dock Navigation */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 pb-safe">
        <Dock className="bg-card/80 backdrop-blur-md border-t border-x border-border/50 rounded-t-2xl shadow-2xl overflow-hidden">
          {/* Unified Accordion Expansion */}
          <DockExpansion />
          
          {/* Button Row */}
          <div className="flex items-center justify-center gap-2 pb-3 px-4 py-3">
            {/* Resources */}
            <DockItem itemId="resources">
              <DockIcon>
                <DockIconCircle itemId="resources">
                  <BookOpen className="h-5 w-5 text-foreground" />
                </DockIconCircle>
              </DockIcon>
            </DockItem>
            
            {/* Time Off */}
            <DockItem itemId="timeoff">
              <DockIcon>
                <DockIconCircle itemId="timeoff">
                  <Calendar className="h-5 w-5 text-foreground" />
                </DockIconCircle>
              </DockIcon>
            </DockItem>

            {/* Learning */}
            <DockItem itemId="learning">
              <DockIcon>
                <DockIconCircle itemId="learning">
                  <GraduationCap className="h-5 w-5 text-foreground" />
                </DockIconCircle>
              </DockIcon>
            </DockItem>

            {/* Community */}
            <DockItem itemId="community">
              <DockIcon>
                <DockIconCircle itemId="community">
                  <MessageSquare className="h-5 w-5 text-foreground" />
                </DockIconCircle>
              </DockIcon>
            </DockItem>

            {/* Feedback */}
            <DockItem itemId="feedback">
              <DockIcon>
                <DockIconCircle itemId="feedback">
                  <Lightbulb className="h-5 w-5 text-foreground" />
                </DockIconCircle>
              </DockIcon>
            </DockItem>

            {/* Manager Tools */}
            {(user.role === 'manager' || user.role === 'admin') && (
              <DockItem itemId="manager">
                <DockIcon>
                  <DockIconCircle itemId="manager">
                    <Briefcase className="h-5 w-5 text-spirits-magenta" />
                  </DockIconCircle>
                </DockIcon>
              </DockItem>
            )}
          </div>
        </Dock>
      </div>
    </div>
  )
}
