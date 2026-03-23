'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface BarredDisclaimerModalProps {
  onAccept: () => void
}

/**
 * Shown every time the barred section is opened (no persistence).
 * User must read and acknowledge before viewing barred data.
 */
export function BarredDisclaimerModal({ onAccept }: BarredDisclaimerModalProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [acknowledged, setAcknowledged] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  const handleDecline = () => {
    router.push('/dashboard')
  }

  if (!mounted) return null

  const content = (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black p-4 sm:p-6"
      style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top, 0px))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="barred-disclaimer-title"
      aria-describedby="barred-disclaimer-body"
    >
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-start gap-3 p-5 sm:p-6 border-b border-border/50 bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive shrink-0 mt-0.5" aria-hidden />
          <div className="min-w-0">
            <h2
              id="barred-disclaimer-title"
              className="text-xl sm:text-2xl font-bold text-foreground"
            >
              Confidential — read before continuing
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              You must accept to access the Barred List.
            </p>
          </div>
        </div>

        <div
          id="barred-disclaimer-body"
          className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-sm sm:text-base text-foreground leading-relaxed"
        >
          <p>
            <strong>This is GDPR-protected and highly sensitive information.</strong> It is{' '}
            <strong>not for public viewing</strong> and must not be shared casually, posted online,
            or discussed outside authorised work needs.
          </p>
          <p>
            Having access to this list does <strong>not</strong> authorise copying, screenshots,
            forwarding, or any other misuse. Misuse may breach data protection law, employment
            terms, and company policy and could result in disciplinary action.
          </p>
          <p>
            By accepting below, you confirm you understand these risks and will use this data only
            for legitimate business purposes. <strong>Gaitens Leisure Group is not liable for misuse</strong>{' '}
            of this information by you or by anyone who obtains access through your account or device.
          </p>

          <label className="flex items-start gap-3 cursor-pointer touch-manipulation rounded-xl border border-border/60 bg-muted/30 p-4">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border"
            />
            <span className="text-sm text-foreground">
              I have read and understand the above. I accept responsibility for how I use this
              information.
            </span>
          </label>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-2 p-4 sm:p-6 border-t border-border/50 bg-card">
          <Button type="button" variant="outline" className="w-full sm:flex-1" onClick={handleDecline}>
            Decline — leave
          </Button>
          <Button
            type="button"
            className="w-full sm:flex-1"
            disabled={!acknowledged}
            onClick={onAccept}
          >
            Accept and continue
          </Button>
        </div>
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
