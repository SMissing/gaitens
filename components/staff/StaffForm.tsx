'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { X, Save, ArrowLeft } from 'lucide-react'
import type { User, UserRole } from '@/types/database'

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'staff', label: 'Staff' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Admin' },
]

interface StaffFormProps {
  staff?: User | null
  onClose: () => void
  viewerRole: UserRole
  allowedCreateRoles: UserRole[]
}

export function StaffForm({
  staff,
  onClose,
  viewerRole,
  allowedCreateRoles,
}: StaffFormProps) {
  const defaultRole = useMemo(() => {
    if (allowedCreateRoles.length === 1) return allowedCreateRoles[0]
    return (allowedCreateRoles.includes('staff') ? 'staff' : allowedCreateRoles[0]) ?? 'staff'
  }, [allowedCreateRoles])

  const [formData, setFormData] = useState({
    name: '',
    staffCode: '',
    role: 'staff' as UserRole,
    site: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeAccount, setActiveAccount] = useState(true)

  const isEdit = Boolean(staff)
  const managerEditingStaff =
    viewerRole === 'manager' && staff?.role === 'staff'

  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.name,
        staffCode: staff.staffCode,
        role: staff.role,
        site: staff.site || '',
      })
      setActiveAccount(staff.active)
    } else {
      setFormData({
        name: '',
        staffCode: '',
        role: defaultRole,
        site: '',
      })
      setActiveAccount(true)
    }
  }, [staff, defaultRole])

  const roleSelectOptions = useMemo(() => {
    if (isEdit && viewerRole === 'admin') {
      return ROLE_OPTIONS
    }
    if (!isEdit) {
      return ROLE_OPTIONS.filter((o) => allowedCreateRoles.includes(o.value))
    }
    return []
  }, [isEdit, viewerRole, allowedCreateRoles])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const url = staff ? `/api/staff/${staff.id}` : '/api/staff'
      const method = staff ? 'PUT' : 'POST'

      const payload: Record<string, unknown> = {
        name: formData.name,
        staffCode: formData.staffCode,
        site: formData.site || null,
      }

      if (viewerRole === 'admin') {
        payload.role = formData.role
      } else if (!isEdit) {
        payload.role = formData.role
      } else if (managerEditingStaff) {
        payload.role = 'staff'
      }

      if (isEdit) {
        payload.active = activeAccount
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to save staff member')
      }

      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-border/40 bg-card/50">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div className="space-y-1 pr-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-ml-2 mb-2 h-8 px-2 text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to directory
          </Button>
          <CardTitle className="text-xl sm:text-2xl">
            {staff ? 'Edit account' : 'New account'}
          </CardTitle>
          <CardDescription>
            {staff
              ? 'Update details for this team member.'
              : 'Create a login for the staff portal (4-digit code).'}
          </CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <div className="space-y-2">
            <Label htmlFor="name">Full name *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              placeholder="Full name"
              className="bg-background/60"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="staffCode">Staff code *</Label>
            <Input
              id="staffCode"
              type="text"
              inputMode="numeric"
              value={formData.staffCode}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  staffCode: e.target.value.replace(/\D/g, '').slice(0, 4),
                })
              }
              required
              placeholder="0000"
              maxLength={4}
              pattern="\d{4}"
              className="bg-background/60 font-mono tabular-nums"
            />
            <p className="text-xs text-muted-foreground">Exactly 4 digits</p>
          </div>

          {isEdit && viewerRole === 'manager' && staff?.role === 'staff' ? (
            <div className="space-y-2">
              <Label>Role</Label>
              <p className="text-sm text-muted-foreground rounded-lg border border-border/40 bg-background/40 px-3 py-2">
                Staff — managers cannot promote to manager or admin
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                id="role"
                options={roleSelectOptions}
                value={formData.role}
                onChange={(value) =>
                  setFormData({ ...formData, role: value as UserRole })
                }
                placeholder="Select role"
                required
                disabled={loading || (!isEdit && roleSelectOptions.length <= 1)}
              />
              {!isEdit && viewerRole === 'manager' && (
                <p className="text-xs text-muted-foreground">
                  You can only create staff accounts.
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="site">Site</Label>
            <Input
              id="site"
              type="text"
              value={formData.site}
              onChange={(e) =>
                setFormData({ ...formData, site: e.target.value })
              }
              placeholder="Optional"
              className="bg-background/60"
            />
          </div>

          {isEdit && (
            <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/40 px-3 py-2.5">
              <input
                id="staff-active"
                type="checkbox"
                checked={activeAccount}
                onChange={(e) => setActiveAccount(e.target.checked)}
                className="h-4 w-4 shrink-0 rounded border-border bg-background accent-spirits-cyan"
              />
              <Label htmlFor="staff-active" className="cursor-pointer text-sm font-normal leading-snug">
                Account active (can sign in to the portal)
              </Label>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="border-border/50"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="sm:min-w-[120px]">
              <Save className="h-4 w-4" />
              {loading ? 'Saving…' : staff ? 'Save changes' : 'Create account'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
