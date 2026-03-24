import type { User, UserRole } from '@/types/database'

/** Normalizes GET /api/staff JSON (legacy array or { staff }) */
export function staffListFromApiResponse(data: unknown): User[] {
  if (Array.isArray(data)) return data as User[]
  if (
    data &&
    typeof data === 'object' &&
    Array.isArray((data as { staff?: unknown }).staff)
  ) {
    return (data as { staff: User[] }).staff
  }
  return []
}

export function parseStaffDirectoryGet(data: unknown): {
  staff: User[]
  allowedCreateRoles: UserRole[]
} {
  const staff = staffListFromApiResponse(data)
  if (data && typeof data === 'object' && 'allowedCreateRoles' in data) {
    const raw = (data as { allowedCreateRoles?: unknown }).allowedCreateRoles
    const allowedCreateRoles = Array.isArray(raw)
      ? (raw as UserRole[]).filter((r): r is UserRole =>
          ['staff', 'manager', 'admin'].includes(r as string)
        )
      : []
    return { staff, allowedCreateRoles }
  }
  return { staff, allowedCreateRoles: [] }
}

/** Managers cannot see admin login codes; admins see all. */
export function canViewTargetStaffCode(
  viewerRole: UserRole,
  targetRole: UserRole
): boolean {
  if (viewerRole === 'admin') return true
  if (viewerRole === 'manager') return targetRole !== 'admin'
  return false
}

/** Admins may change anyone; managers may change only staff. */
export function canModifyTargetUser(
  viewerRole: UserRole,
  targetRole: UserRole
): boolean {
  if (viewerRole === 'admin') return true
  if (viewerRole === 'manager') return targetRole === 'staff'
  return false
}

export function allowedCreateRoles(viewerRole: UserRole): UserRole[] {
  if (viewerRole === 'admin') return ['staff', 'manager', 'admin']
  if (viewerRole === 'manager') return ['staff']
  return []
}

export const MASKED_STAFF_CODE = '••••'
