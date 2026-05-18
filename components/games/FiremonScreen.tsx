'use client'

import * as React from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Firemon } from '@/components/games/Firemon'

interface FiremonScreenProps {
  currentUserId: string
}

/** Full-screen shell for the Firemon training battle */
export function FiremonScreen({ currentUserId: _currentUserId }: FiremonScreenProps) {
  return (
    <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden overscroll-none bg-[#0a0c10] text-zinc-100">
      <header
        className="shrink-0 border-b border-white/[0.06] bg-zinc-950/95"
        style={{
          paddingTop: 'max(8px, env(safe-area-inset-top, 0px))',
          paddingBottom: '8px',
          paddingLeft: 'max(12px, env(safe-area-inset-left, 0px))',
          paddingRight: 'max(12px, env(safe-area-inset-right, 0px))',
        }}
      >
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            aria-label="Back to dashboard"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-zinc-200 active:scale-[0.97]"
          >
            <ChevronLeft className="size-5" strokeWidth={2.25} aria-hidden />
          </Link>

          <h1 className="min-w-0 flex-1 text-center font-['Bebas_Neue',sans-serif] text-lg tracking-[0.14em] text-zinc-50">
            FIREMON
          </h1>

          <div className="size-10 shrink-0" aria-hidden />
        </div>
      </header>

      <Firemon />
    </div>
  )
}
