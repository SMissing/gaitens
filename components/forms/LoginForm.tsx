'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getPostLoginPath } from '@/lib/safe-return-url'
import { loginSchema } from '@/lib/validation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Delete } from 'lucide-react'

interface LoginFormProps {
  fromQuery?: string | null
}

export default function LoginForm({ fromQuery }: LoginFormProps) {
  const router = useRouter()
  const [staffCode, setStaffCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showNameConfirmation, setShowNameConfirmation] = useState(false)
  const [userName, setUserName] = useState('')
  const [userId, setUserId] = useState('')


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

      const destination = getPostLoginPath(fromQuery)
      router.push(destination)
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

  const handleNumberClick = (num: string) => {
    if (staffCode.length < 4 && !isLoading) {
      setStaffCode(prev => prev + num)
      setError(null)
    }
  }

  const handleBackspace = () => {
    setStaffCode(prev => prev.slice(0, -1))
    setError(null)
  }

  const handleClear = () => {
    setStaffCode('')
    setError(null)
  }

  const handleSubmit = useCallback(async () => {
    if (staffCode.length !== 4) return
    
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
        // Clear the entered code so we don't immediately re-submit the same invalid code
        // via the auto-submit effect, and so the user can re-enter a new code.
        setStaffCode('')
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
  }, [staffCode])

  // Auto-submit when 4 digits are entered
  useEffect(() => {
    if (staffCode.length === 4 && !isLoading && !showNameConfirmation) {
      const timer = setTimeout(() => {
        handleSubmit()
      }, 300) // Small delay for better UX
      return () => clearTimeout(timer)
    }
  }, [staffCode, isLoading, showNameConfirmation, handleSubmit])

  if (showNameConfirmation) {
    return (
      <Card className="rounded-3xl border-border/50 shadow-lg backdrop-blur-md bg-background/80">
        <CardHeader className="text-center">
          <CardTitle className="text-xl sm:text-2xl">Confirm Login</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Is this you? <span className="font-semibold text-card-foreground">{userName}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-4 bg-destructive/20 border border-destructive/50 rounded-full text-destructive-foreground text-sm text-center backdrop-blur-md">
              {error}
            </div>
          )}
          <div className="space-y-3">
            <Button
              onClick={handleConfirmLogin}
              disabled={isLoading}
              className={cn(
                "w-full rounded-full h-12 sm:h-14 text-base sm:text-lg font-semibold",
                "bg-spirits-cyan text-background hover:bg-spirits-cyanDark",
                "shadow-lg active:scale-98 transition-all"
              )}
            >
              {isLoading ? 'Logging in...' : 'Yes, Continue'}
            </Button>
            <Button
              onClick={handleCancel}
              disabled={isLoading}
              variant="secondary"
              className="w-full rounded-full h-12 sm:h-14 text-base sm:text-lg font-semibold shadow-lg active:scale-98 transition-all"
            >
              No, Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full space-y-8">
      {/* Code Display */}
      <div className="flex justify-center gap-3 sm:gap-4">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={cn(
              "w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 flex items-center justify-center text-3xl sm:text-4xl font-bold transition-all",
              staffCode[index]
                ? "bg-spirits-cyan/20 border-spirits-cyan text-spirits-cyan backdrop-blur-md"
                : "bg-background/40 border-border/30 text-muted-foreground/30 backdrop-blur-sm",
              "shadow-lg"
            )}
          >
            {/* Mask PIN: never show digits on screen — one * per digit entered */}
            {staffCode[index] ? '*' : '•'}
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-destructive/20 border border-destructive/50 rounded-full text-destructive-foreground text-sm text-center backdrop-blur-md">
          {error}
        </div>
      )}

      {/* Number Pad - 12 buttons: C, 0-9, Backspace */}
      <div className="space-y-4">
        {/* Row 1-3: Numbers 1-9 */}
        <div className="grid grid-cols-3 gap-4 sm:gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleNumberClick(num.toString())}
              disabled={isLoading || staffCode.length >= 4}
              className={cn(
                "aspect-square w-full max-w-[80px] sm:max-w-[100px] mx-auto",
                "rounded-full text-2xl sm:text-3xl font-semibold",
                "bg-background/30 backdrop-blur-md border border-border/30",
                "text-foreground shadow-lg",
                "hover:bg-background/40 hover:scale-105 active:scale-95",
                "transition-all duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              )}
            >
              {num}
            </button>
          ))}
        </div>

        {/* Row 4: C (clear), 0, Backspace */}
        <div className="grid grid-cols-3 gap-4 sm:gap-5">
          {/* Clear Button */}
          <button
            type="button"
            onClick={handleClear}
            disabled={isLoading || staffCode.length === 0}
            className={cn(
              "aspect-square w-full max-w-[80px] sm:max-w-[100px] mx-auto",
              "rounded-full text-xl sm:text-2xl font-semibold",
              "bg-destructive/20 backdrop-blur-md border border-destructive/30",
              "text-destructive-foreground shadow-lg",
              "hover:bg-destructive/30 hover:scale-105 active:scale-95",
              "transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            )}
          >
            C
          </button>
          
          {/* Zero Button */}
          <button
            type="button"
            onClick={() => handleNumberClick('0')}
            disabled={isLoading || staffCode.length >= 4}
            className={cn(
              "aspect-square w-full max-w-[80px] sm:max-w-[100px] mx-auto",
              "rounded-full text-2xl sm:text-3xl font-semibold",
              "bg-background/30 backdrop-blur-md border border-border/30",
              "text-foreground shadow-lg",
              "hover:bg-background/40 hover:scale-105 active:scale-95",
              "transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            )}
          >
            0
          </button>
          
          {/* Backspace Button */}
          <button
            type="button"
            onClick={handleBackspace}
            disabled={isLoading || staffCode.length === 0}
            className={cn(
              "aspect-square w-full max-w-[80px] sm:max-w-[100px] mx-auto",
              "rounded-full text-lg sm:text-xl font-semibold",
              "bg-background/30 backdrop-blur-md border border-border/30",
              "text-foreground shadow-lg",
              "hover:bg-background/40 hover:scale-105 active:scale-95",
              "transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
              "flex items-center justify-center"
            )}
          >
            <Delete className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>
      </div>

      {/* Loading indicator when submitting */}
      {isLoading && (
        <div className="flex justify-center pt-4">
          <div className="px-6 py-3 bg-spirits-cyan/20 border border-spirits-cyan/50 rounded-full backdrop-blur-md">
            <span className="text-spirits-cyan font-semibold">Checking...</span>
          </div>
        </div>
      )}
    </div>
  )
}
