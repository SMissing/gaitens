import { createServerClient } from './db'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { User } from '@/types/database'

// Session duration: 8 hours
const SESSION_DURATION = 8 * 60 * 60 * 1000

// Failed login attempts tracking (in-memory for simplicity)
// In production, consider using Redis or database
const failedAttempts = new Map<string, { count: number; lockedUntil: number | null }>()

/**
 * Get lock expiry time for a staff code
 */
export function getLockExpiry(staffCode: string): number | null {
  const attempts = failedAttempts.get(staffCode)
  return attempts?.lockedUntil || null
}

// Lock duration: 5 minutes
const LOCK_DURATION = 5 * 60 * 1000
const MAX_FAILED_ATTEMPTS = 5

/**
 * Check if a staff code is locked due to too many failed attempts
 */
export function isCodeLocked(staffCode: string): boolean {
  const attempts = failedAttempts.get(staffCode)
  if (!attempts) return false

  if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
    return true
  }

  // Lock expired, reset
  if (attempts.lockedUntil && Date.now() >= attempts.lockedUntil) {
    failedAttempts.delete(staffCode)
    return false
  }

  return false
}

/**
 * Record a failed login attempt
 */
export function recordFailedAttempt(staffCode: string): void {
  const attempts = failedAttempts.get(staffCode) || { count: 0, lockedUntil: null }

  attempts.count += 1

  if (attempts.count >= MAX_FAILED_ATTEMPTS) {
    attempts.lockedUntil = Date.now() + LOCK_DURATION
  }

  failedAttempts.set(staffCode, attempts)
}

/**
 * Clear failed attempts on successful login
 */
export function clearFailedAttempts(staffCode: string): void {
  failedAttempts.delete(staffCode)
}

/**
 * Get user by staff code
 */
export async function getUserByStaffCode(staffCode: string): Promise<User | null> {
  try {
    const supabase = createServerClient()
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('staffCode', staffCode)
      .eq('active', true)
      .single()

    if (error) {
      console.error('Supabase error in getUserByStaffCode:', error)
      return null
    }

    if (!data) {
      return null
    }

    return data as User
  } catch (error) {
    console.error('Error in getUserByStaffCode:', error)
    throw error
  }
}

/**
 * Create a session for the user
 */
export async function createSession(userId: string): Promise<void> {
  const cookieStore = cookies()
  const expiresAt = new Date(Date.now() + SESSION_DURATION)

  // Store session in cookie
  cookieStore.set('session_user_id', userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
  })
}

/**
 * Get current user from session
 */
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = cookies()
  const userId = cookieStore.get('session_user_id')?.value

  if (!userId) {
    return null
  }

  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .eq('active', true)
    .single()

  if (error || !data) {
    return null
  }

  return data as User
}

/**
 * Clear session (logout)
 */
export async function clearSession(): Promise<void> {
  const cookieStore = cookies()
  cookieStore.delete('session_user_id')
}

/**
 * Get authenticated user for API routes - returns null if not authenticated
 * Use this in API routes instead of requireAuth() to avoid redirect errors
 */
export async function getAuthUser(): Promise<User | null> {
  return await getCurrentUser()
}

/**
 * Require authentication - redirects to login if not authenticated
 * Use this in page components and server components
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return user
}

/**
 * Require manager or admin role
 */
export async function requireManager(): Promise<User> {
  const user = await requireAuth()

  if (user.role !== 'manager' && user.role !== 'admin') {
    redirect('/dashboard')
  }

  return user
}

/**
 * Require admin role
 */
export async function requireAdmin(): Promise<User> {
  const user = await requireAuth()

  if (user.role !== 'admin') {
    redirect('/dashboard')
  }

  return user
}
