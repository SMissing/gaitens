'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Page } from '@/components/layout/Page'
import { X, Save } from 'lucide-react'
import type { User, UserRole } from '@/types/database'

interface StaffFormProps {
  staff?: User | null
  onClose: () => void
}

export function StaffForm({ staff, onClose }: StaffFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    staffCode: '',
    role: 'staff' as UserRole,
    site: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.name,
        staffCode: staff.staffCode,
        role: staff.role,
        site: staff.site || '',
      })
    }
  }, [staff])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const url = staff ? `/api/staff/${staff.id}` : '/api/staff'
      const method = staff ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
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
    <Page>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {staff ? 'Edit Staff Member' : 'Add New Staff Member'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {staff
                ? 'Update staff member information'
                : 'Create a new staff member account'}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              placeholder="Enter full name"
            />
          </div>

          {/* Staff Code */}
          <div className="space-y-2">
            <Label htmlFor="staffCode">Staff Code *</Label>
            <Input
              id="staffCode"
              type="text"
              value={formData.staffCode}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  staffCode: e.target.value.replace(/\D/g, '').slice(0, 4),
                })
              }
              required
              placeholder="4 digit code"
              maxLength={4}
              pattern="\d{4}"
            />
            <p className="text-xs text-muted-foreground">
              Must be exactly 4 digits
            </p>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value as UserRole })
              }
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Site */}
          <div className="space-y-2">
            <Label htmlFor="site">Site</Label>
            <Input
              id="site"
              type="text"
              value={formData.site}
              onChange={(e) =>
                setFormData({ ...formData, site: e.target.value })
              }
              placeholder="Enter site name (optional)"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Saving...' : staff ? 'Update' : 'Create'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Page>
  )
}
