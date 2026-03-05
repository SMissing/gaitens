'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Page } from '@/components/layout/Page'
import { formatDate } from '@/lib/date-utils'
import { Search, Plus, Edit2, UserCheck, UserX, Users } from 'lucide-react'
import type { User } from '@/types/database'
import { StaffForm } from './StaffForm'

export function StaffList() {
  const [staff, setStaff] = useState<User[]>([])
  const [filteredStaff, setFilteredStaff] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [activeFilter, setActiveFilter] = useState<string>('active')
  const [showForm, setShowForm] = useState(false)
  const [editingStaff, setEditingStaff] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStaff()
  }, [])

  useEffect(() => {
    filterStaff()
  }, [staff, searchQuery, roleFilter, activeFilter])

  const fetchStaff = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/staff')
      if (!response.ok) {
        throw new Error('Failed to fetch staff')
      }
      const data = await response.json()
      setStaff(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const filterStaff = () => {
    let filtered = [...staff]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (member) =>
          member.name.toLowerCase().includes(query) ||
          member.staffCode.includes(query) ||
          member.site?.toLowerCase().includes(query)
      )
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((member) => member.role === roleFilter)
    }

    // Active filter
    if (activeFilter === 'active') {
      filtered = filtered.filter((member) => member.active)
    } else if (activeFilter === 'inactive') {
      filtered = filtered.filter((member) => !member.active)
    }

    setFilteredStaff(filtered)
  }

  const handleEdit = (member: User) => {
    setEditingStaff(member)
    setShowForm(true)
  }

  const handleToggleActive = async (member: User) => {
    try {
      const response = await fetch(`/api/staff/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !member.active }),
      })

      if (!response.ok) {
        throw new Error('Failed to update staff member')
      }

      await fetchStaff()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update staff member')
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingStaff(null)
    fetchStaff()
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/20 text-red-400 border-red-500/50'
      case 'manager':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50'
      case 'staff':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    }
  }

  if (showForm) {
    return (
      <StaffForm
        staff={editingStaff}
        onClose={handleFormClose}
      />
    )
  }

  return (
    <Page>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Manage Staff</h1>
            <p className="text-muted-foreground">
              View and manage all staff members
            </p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Add Staff Member
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, code, or site..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">All Roles</option>
            <option value="staff">Staff</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Staff List */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading staff members...
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No staff members found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredStaff.map((member) => (
              <div
                key={member.id}
                className="bg-card/50 border border-border/50 rounded-lg p-4 hover:border-border transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {member.name}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium border ${getRoleBadgeColor(
                          member.role
                        )}`}
                      >
                        {member.role.toUpperCase()}
                      </span>
                      {!member.active && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/50">
                          INACTIVE
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>Code: {member.staffCode}</span>
                      {member.site && <span>Site: {member.site}</span>}
                      <span>
                        Joined: {formatDate(member.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(member)}
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant={member.active ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => handleToggleActive(member)}
                    >
                      {member.active ? (
                        <>
                          <UserX className="h-4 w-4" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4" />
                          Activate
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {!loading && (
          <div className="pt-4 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              Showing {filteredStaff.length} of {staff.length} staff members
            </p>
          </div>
        )}
      </div>
    </Page>
  )
}
