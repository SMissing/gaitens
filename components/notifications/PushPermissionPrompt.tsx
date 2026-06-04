'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Bell, BellOff, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/button'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const output = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) output[i] = rawData.charCodeAt(i)
  return output
}

type GateState = 'checking' | 'clear' | 'prompt' | 'loading' | 'denied' | 'success' | 'add-to-homescreen'

const STARS = [
  { top: '12%', left: '7%',  size: 2,   opacity: 0.35 },
  { top: '7%',  left: '24%', size: 1,   opacity: 0.25 },
  { top: '20%', left: '42%', size: 1.5, opacity: 0.2  },
  { top: '6%',  left: '58%', size: 2,   opacity: 0.3  },
  { top: '16%', left: '73%', size: 1,   opacity: 0.25 },
  { top: '28%', left: '88%', size: 1.5, opacity: 0.18 },
  { top: '9%',  left: '95%', size: 1,   opacity: 0.28 },
  { top: '35%', left: '15%', size: 1,   opacity: 0.2  },
  { top: '42%', left: '52%', size: 1.5, opacity: 0.12 },
  { top: '25%', left: '63%', size: 1,   opacity: 0.22 },
]

async function checkSubscribed(): Promise<boolean> {
  try {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    return !!sub
  } catch {
    return false
  }
}

async function subscribeToPush(): Promise<boolean> {
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  if (!vapidKey) return false
  try {
    const reg = await navigator.serviceWorker.ready
    let sub = await reg.pushManager.getSubscription()
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as unknown as BufferSource,
      })
    }
    const res = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: sub.toJSON() }),
    })
    return res.ok
  } catch {
    return false
  }
}

function GateHeader() {
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    } catch {
      setLoggingOut(false)
    }
  }

  return (
    <header
      className="w-full bg-[oklch(0.08_0_0)]/90 backdrop-blur-md border-b border-border/50 flex-shrink-0"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="w-full max-w-md sm:max-w-2xl lg:max-w-4xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
        <div className="relative flex min-h-[44px] flex-col items-center justify-center">
          {/* Logo centred */}
          <img
            src="/logos/gaitens-text-logo.png"
            alt="Gaitens Leisure Group"
            className="h-10 w-auto sm:h-12 lg:h-16"
          />
          {/* Logout right */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 pr-0.5">
            <Button
              onClick={handleLogout}
              disabled={loggingOut}
              variant="secondary"
              size="sm"
            >
              {loggingOut ? 'Logging out…' : 'Logout'}
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

export function PushPermissionPrompt() {
  const [state, setState] = useState<GateState>('checking')

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true

    // iOS Safari browser (not installed as PWA) — Push requires home screen install
    if (isIOS && !isStandalone) {
      setState('add-to-homescreen')
      return
    }

    // Push not supported on this browser/device — let them through
    if (
      typeof window === 'undefined' ||
      !('Notification' in window) ||
      !('serviceWorker' in navigator) ||
      !('PushManager' in window)
    ) {
      setState('clear')
      return
    }

    const run = async () => {
      if (Notification.permission === 'denied') {
        setState('denied')
        return
      }
      if (Notification.permission === 'granted') {
        const subscribed = await checkSubscribed()
        if (subscribed) { setState('clear'); return }
        const ok = await subscribeToPush()
        setState(ok ? 'clear' : 'prompt')
        return
      }
      setState('prompt')
    }

    run()
  }, [])

  const handleEnable = async () => {
    setState('loading')
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      const ok = await subscribeToPush()
      if (ok) {
        setState('success')
        setTimeout(() => setState('clear'), 2000)
      } else {
        setState('prompt')
      }
    } else {
      setState('denied')
    }
  }

  const handleCheckAgain = async () => {
    setState('loading')
    if (Notification.permission === 'granted') {
      const ok = await subscribeToPush()
      if (ok) {
        setState('success')
        setTimeout(() => setState('clear'), 2000)
      } else {
        setState('prompt')
      }
    } else if (Notification.permission === 'default') {
      setState('prompt')
    } else {
      setState('denied')
    }
  }

  if (state === 'checking' || state === 'clear') return null

  return createPortal(
    <AnimatePresence>
      {(state === 'prompt' || state === 'loading' || state === 'denied' || state === 'success' || state === 'add-to-homescreen') && (
        <motion.div
          key="gate"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[9999] flex flex-col"
          style={{ background: '#0c0c1e' }}
        >
          {/* ── Gradient + stars — z-0 so they sit behind everything ── */}
          <div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{ background: 'linear-gradient(180deg, #1e0a5e 0%, #0d1b52 35%, #0c0c1e 100%)' }}
          />
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden>
            {STARS.map((s, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white"
                style={{ top: s.top, left: s.left, width: s.size, height: s.size, opacity: s.opacity }}
              />
            ))}
          </div>

          {/* Logo watermark */}
          <div
            className="absolute top-0 right-0 w-40 h-40 select-none pointer-events-none"
            style={{ opacity: 0.07 }}
            aria-hidden
          >
            <img src="/logos/gaitens-logo-white.png" alt="" className="w-full h-full object-contain object-right-top" />
          </div>

          {/* ── Replica top bar — above gradient (z-10) ─────── */}
          <div className="relative z-10 flex-shrink-0">
            <GateHeader />
          </div>

          {/* ── Centred content ──────────────────────────────── */}
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center px-8">
            <div className="w-full max-w-sm">

              {/* Icon */}
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, type: 'spring', bounce: 0.4, duration: 0.5 }}
                className="flex justify-center mb-6"
              >
                <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-orange-500/20 border border-orange-500/30 shadow-2xl shadow-orange-500/20">
                  {state === 'denied'
                    ? <BellOff className="h-12 w-12 text-white/40" />
                    : state === 'add-to-homescreen'
                    ? <span className="text-5xl leading-none select-none">📱</span>
                    : <Bell className="h-12 w-12 text-orange-300" />
                  }
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.4 }}
              >
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35 mb-2">
                  Gaitens Leisure
                </p>

                {state === 'add-to-homescreen' ? (
                  <>
                    <h1 className="text-3xl font-black text-white leading-tight mb-3">
                      Add to Home<br />Screen first
                    </h1>
                    <p className="text-sm text-white/50 leading-relaxed mb-6">
                      To enable notifications, this app needs to be installed on your iPhone. It only takes a few seconds.
                    </p>
                    <div className="text-left space-y-3 mb-8">
                      {[
                        { step: '1', text: 'Tap the Share button at the bottom of Safari', icon: '⬆️' },
                        { step: '2', text: 'Scroll down and tap "Add to Home Screen"', icon: '＋' },
                        { step: '3', text: 'Tap "Add" in the top right corner', icon: '✓' },
                        { step: '4', text: 'Open the app from your home screen', icon: '📱' },
                      ].map(({ step, text, icon }) => (
                        <div key={step} className="flex items-start gap-3">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500/20 border border-orange-500/30 text-xs font-black text-orange-300">
                            {step}
                          </div>
                          <p className="text-sm text-white/60 leading-snug pt-1">{text}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-white/30 text-center">
                      Requires iOS 16.4 or later
                    </p>
                  </>

                ) : state === 'success' ? (
                  <>
                    <h1 className="text-3xl font-black text-white leading-tight mb-3">You&apos;re all set!</h1>
                    <p className="text-sm text-white/50">Notifications enabled. Taking you in…</p>
                  </>

                ) : state === 'denied' ? (
                  <>
                    <h1 className="text-3xl font-black text-white leading-tight mb-2">
                      Turn on<br />Notifications
                    </h1>
                    <p className="text-sm text-white/45 mb-6">
                      You&apos;ve previously blocked notifications. Follow these steps on your iPhone:
                    </p>

                    {/* Visual step-by-step — looks like iOS UI */}
                    <div className="text-left space-y-2 mb-8 w-full">

                      {/* Step 1 */}
                      <div className="flex items-center gap-3 rounded-2xl bg-white/[0.06] border border-white/10 px-4 py-3">
                        <span className="text-2xl leading-none">⚙️</span>
                        <div className="min-w-0">
                          <p className="text-xs text-white/35 font-semibold uppercase tracking-wide mb-0.5">Step 1</p>
                          <p className="text-sm font-bold text-white">Open Settings</p>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <div className="h-4 w-px bg-white/15" />
                      </div>

                      {/* Step 2 */}
                      <div className="flex items-center gap-3 rounded-2xl bg-white/[0.06] border border-white/10 px-4 py-3">
                        <span className="text-2xl leading-none">📜</span>
                        <div className="min-w-0">
                          <p className="text-xs text-white/35 font-semibold uppercase tracking-wide mb-0.5">Step 2</p>
                          <p className="text-sm font-bold text-white">Scroll down — tap <span className="text-orange-300">Gaitens Portal</span></p>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <div className="h-4 w-px bg-white/15" />
                      </div>

                      {/* Step 3 */}
                      <div className="flex items-center gap-3 rounded-2xl bg-white/[0.06] border border-white/10 px-4 py-3">
                        <span className="text-2xl leading-none">🔔</span>
                        <div className="min-w-0">
                          <p className="text-xs text-white/35 font-semibold uppercase tracking-wide mb-0.5">Step 3</p>
                          <p className="text-sm font-bold text-white">Tap <span className="text-orange-300">Notifications</span> → toggle <span className="text-green-400">ON</span></p>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <div className="h-4 w-px bg-white/15" />
                      </div>

                      {/* Step 4 */}
                      <div className="flex items-center gap-3 rounded-2xl bg-white/[0.06] border border-white/10 px-4 py-3">
                        <span className="text-2xl leading-none">↩️</span>
                        <div className="min-w-0">
                          <p className="text-xs text-white/35 font-semibold uppercase tracking-wide mb-0.5">Step 4</p>
                          <p className="text-sm font-bold text-white">Come back here and tap below</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleCheckAgain}
                      disabled={state === 'loading' as any}
                      className="flex items-center justify-center gap-2 w-full rounded-2xl bg-orange-500 py-4 text-sm font-black text-white shadow-lg shadow-orange-500/25 active:opacity-80 disabled:opacity-60"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Done — check again
                    </button>
                  </>

                ) : (
                  <>
                    <h1 className="text-3xl font-black text-white leading-tight mb-3">
                      Stay in the<br />loop
                    </h1>
                    <p className="text-sm text-white/50 leading-relaxed mb-8">
                      Enable notifications to get training reminders, badge awards, and important updates from your team.
                    </p>
                    <button
                      onClick={handleEnable}
                      disabled={state === 'loading'}
                      className="w-full rounded-2xl bg-orange-500 py-4 text-base font-black text-white shadow-xl shadow-orange-500/30 active:opacity-80 disabled:opacity-60"
                    >
                      {state === 'loading' ? 'Enabling…' : 'Enable Notifications'}
                    </button>
                  </>
                )}
              </motion.div>
            </div>
          </div>

          {/* Bottom padding to clear dock height visually */}
          <div
            className="flex-shrink-0"
            style={{ height: 'calc(env(safe-area-inset-bottom, 0px) + 5rem)' }}
          />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
