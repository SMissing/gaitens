'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginSchema } from '@/lib/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function LoginForm() {
  const router = useRouter()
  const [staffCode, setStaffCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showNameConfirmation, setShowNameConfirmation] = useState(false)
  const [userName, setUserName] = useState('')
  const [userId, setUserId] = useState('')

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate staff code format
    const validation = loginSchema.safeParse({ staffCode })
    if (!validation.success) {
      setError('Please enter a valid 4-digit code')
      return
    }

    setIsLoading(true)

    try {
      // Check if code is locked
      const lockResponse = await fetch('/api/auth/check-lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffCode }),
      })

      if (!lockResponse.ok) {
        const lockData = await lockResponse.json()
        if (lockData.locked) {
          const minutesLeft = Math.ceil(lockData.lockedUntil / 60000)
          setError(`Too many failed attempts. Please try again in ${minutesLeft} minute(s).`)
          setIsLoading(false)
          return
        }
      }

      // Get user by staff code
      const userResponse = await fetch('/api/auth/get-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffCode }),
      })

      if (!userResponse.ok) {
        const errorData = await userResponse.json()
        setError(errorData.error || 'Invalid staff code')
        setIsLoading(false)
        return
      }

      const userData = await userResponse.json()
      
      // Show name confirmation
      setUserName(userData.name)
      setUserId(userData.id)
      setShowNameConfirmation(true)
      setIsLoading(false)
    } catch (err) {
      setError('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  const handleConfirmLogin = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || 'Login failed')
        setIsLoading(false)
        return
      }

      // Clear failed attempts on success
      await fetch('/api/auth/clear-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffCode }),
      })

      // Redirect to dashboard
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setShowNameConfirmation(false)
    setStaffCode('')
    setUserName('')
    setUserId('')
    setError(null)
  }

  if (showNameConfirmation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Confirm Login</CardTitle>
          <CardDescription>
            Is this you? <span className="font-semibold text-card-foreground">{userName}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/20 border border-destructive/50 rounded text-destructive-foreground text-sm">
              {error}
            </div>
          )}
          <div className="space-y-3">
            <Button
              onClick={handleConfirmLogin}
              disabled={isLoading}
              className={cn(
                "w-full bg-spirits-cyan text-background hover:bg-spirits-cyanDark",
                "hover:bg-spirits-cyanDark"
              )}
            >
              {isLoading ? 'Logging in...' : 'Yes, Continue'}
            </Button>
            <Button
              onClick={handleCancel}
              disabled={isLoading}
              variant="secondary"
              className="w-full"
            >
              No, Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Enter your 4-digit staff code</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCodeSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="staffCode">Staff Code</Label>
            <Input
              id="staffCode"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{4}"
              maxLength={4}
              value={staffCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '')
                setStaffCode(value)
                setError(null)
              }}
              className={cn(
                "text-center text-2xl tracking-widest",
                "focus-visible:ring-spirits-cyan focus-visible:border-spirits-cyan"
              )}
              placeholder="0000"
              disabled={isLoading}
              autoFocus
            />
          </div>
          {error && (
            <div className="p-3 bg-destructive/20 border border-destructive/50 rounded text-destructive-foreground text-sm">
              {error}
            </div>
          )}
          <Button
            type="submit"
            disabled={isLoading || staffCode.length !== 4}
            className={cn(
              "w-full bg-spirits-cyan text-background hover:bg-spirits-cyanDark"
            )}
          >
            {isLoading ? 'Checking...' : 'Continue'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
