'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate } from '@/lib/date-utils'
import {
  allowedCreateRoles,
  canModifyTargetUser,
  parseStaffDirectoryGet,
} from '@/lib/staff-permissions'
import {
  STAFF_DOCK_ADD_ACCOUNT,
  STAFF_DOCK_CLOSE_FORM,
  STAFF_DOCK_STATE,
} from '@/lib/staff-dock-bridge'
import {
  Users,
  ChevronDown,
  Shield,
  UserCog,
  Settings,
} from 'lucide-react'
import type { User, UserRole } from '@/types/database'
import { StaffForm } from './StaffForm'

const ROLE_ORDER: UserRole[] = ['admin', 'manager', 'staff']

const SECTION_META: Record<
  UserRole,
  { title: string; icon: typeof Shield }
> = {
  admin: { title: 'Admins', icon: Shield },
  manager: { title: 'Managers', icon: UserCog },
  staff: { title: 'Staff', icon: Users },
}

/**
 * Category strip: quiet transparent tint + border (no hover — mobile-first).
 * Tint is applied on both `details` and `summary` so WebKit always paints the header.
 * Manager uses violet (not fuchsia) for reliable rendering on mobile Safari.
 */
function getRoleSectionSurface(role: UserRole): {
  border: string
  tint: string
  iconClass: string
} {
  switch (role) {
    case 'admin':
      return {
        border: 'border-red-500/35',
        tint: 'bg-red-500/[0.09]',
        iconClass: 'text-red-300/85',
      }
    case 'manager':
      return {
        border: 'border-violet-500/40',
        tint: 'bg-violet-500/[0.1]',
        iconClass: 'text-violet-300/85',
      }
    case 'staff':
    default:
      return {
        border: 'border-cyan-500/35',
        tint: 'bg-cyan-500/[0.09]',
        iconClass: 'text-cyan-300/85',
      }
  }
}

const SECTION_LIST_PANEL =
  'border-t border-white/10 bg-[#161616] px-2 pb-2 pt-1.5 space-y-1'

interface StaffListProps {
  currentUser: User
}

export function StaffList({ currentUser }: StaffListProps) {
  const [staff, setStaff] = useState<User[]>([])
  const [createRoles, setCreateRoles] = useState<UserRole[]>(() =>
    allowedCreateRoles(currentUser.role)
  )
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingStaff, setEditingStaff] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/staff')
      if (!response.ok) {
        throw new Error('Failed to fetch staff')
      }
      const data = await response.json()
      const { staff: list, allowedCreateRoles: fromApi } =
        parseStaffDirectoryGet(data)
      setStaff(list)
      setCreateRoles(
        fromApi.length ? fromApi : allowedCreateRoles(currentUser.role)
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [currentUser.role])

  useEffect(() => {
    fetchStaff()
  }, [fetchStaff])

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent(STAFF_DOCK_STATE, {
        detail: {
          formOpen: showForm,
          canAdd: createRoles.length > 0,
        },
      })
    )
  }, [showForm, createRoles.length])

  useEffect(() => {
    const onAdd = () => {
      setEditingStaff(null)
      setShowForm(true)
    }
    const onCloseForm = () => {
      setShowForm(false)
      setEditingStaff(null)
      fetchStaff()
    }
    window.addEventListener(STAFF_DOCK_ADD_ACCOUNT, onAdd)
    window.addEventListener(STAFF_DOCK_CLOSE_FORM, onCloseForm)
    return () => {
      window.removeEventListener(STAFF_DOCK_ADD_ACCOUNT, onAdd)
      window.removeEventListener(STAFF_DOCK_CLOSE_FORM, onCloseForm)
    }
  }, [fetchStaff])

  const byRole = useMemo(() => {
    const map: Record<UserRole, User[]> = {
      admin: [],
      manager: [],
      staff: [],
    }
    for (const m of staff) {
      map[m.role].push(m)
    }
    return map
  }, [staff])

  const handleEdit = (member: User) => {
    setEditingStaff(member)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingStaff(null)
    fetchStaff()
  }

  if (showForm) {
    return (
      <StaffForm
        staff={editingStaff}
        onClose={handleFormClose}
        viewerRole={currentUser.role}
        allowedCreateRoles={createRoles}
      />
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-2xl text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <Card className="border-border/40 bg-[#1e1e1e]/80">
          <CardContent className="p-10 text-center text-muted-foreground">
            Loading directory…
          </CardContent>
        </Card>
      ) : staff.length === 0 ? (
        <Card className="border-border/40">
          <CardContent className="p-10 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-40" />
            <p>No staff in the directory</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {ROLE_ORDER.map((role) => {
            const meta = SECTION_META[role]
            const Icon = meta.icon
            const members = byRole[role]
            const surface = getRoleSectionSurface(role)
            return (
              <details
                key={role}
                className={`group rounded-2xl border-2 overflow-hidden ${surface.border} ${surface.tint}`}
              >
                <summary
                  className={`flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 sm:px-5 sm:py-4 ${surface.tint} [-webkit-tap-highlight-color:transparent] [&::-webkit-details-marker]:hidden`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`h-5 w-5 sm:h-6 sm:w-6 shrink-0 ${surface.iconClass}`}
                    />
                    <div className="min-w-0 text-left">
                      <h2 className="text-base sm:text-lg font-semibold text-foreground">
                        {meta.title}
                      </h2>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {members.length}{' '}
                        {members.length === 1 ? 'person' : 'people'}
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 opacity-90 transition-transform group-open:rotate-180 ${surface.iconClass}`}
                  />
                </summary>
                <div className={SECTION_LIST_PANEL}>
                  {members.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-3 text-center">
                      No one in this category
                    </p>
                  ) : (
                    members.map((member) => {
                      const canManage = canModifyTargetUser(
                        currentUser.role,
                        member.role
                      )
                      return (
                        <div
                          key={member.id}
                          className="flex min-h-9 items-center gap-2 rounded-md border border-white/[0.06] bg-[#1e1e1e] px-2.5 py-1.5 sm:min-h-10 sm:px-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium leading-tight text-foreground">
                              {member.name}
                              {!member.active && (
                                <span className="font-normal text-muted-foreground">
                                  {' '}
                                  · inactive
                                </span>
                              )}
                            </p>
                            <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground sm:text-xs">
                              Last login{' '}
                              {member.last_login_at
                                ? formatDate(member.last_login_at)
                                : 'never'}
                            </p>
                          </div>
                          {canManage ? (
                            <button
                              type="button"
                              onClick={() => handleEdit(member)}
                              className="shrink-0 rounded-lg p-1.5 text-muted-foreground active:bg-white/[0.08] active:text-foreground touch-manipulation"
                              aria-label={`Edit ${member.name}`}
                            >
                              <Settings className="h-4 w-4" strokeWidth={1.75} />
                            </button>
                          ) : null}
                        </div>
                      )
                    })
                  )}
                </div>
              </details>
            )
          })}
        </div>
      )}

      {!loading && staff.length > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          {staff.length} {staff.length === 1 ? 'person' : 'people'} in directory
        </p>
      )}
    </div>
  )
}
