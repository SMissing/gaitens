'use client'

import * as React from 'react'

export interface PlayfieldMetrics {
  /** HUD bottom edge relative to canvas top (px) */
  hudBottomPx: number
  /** Playfield ceiling Y in same coordinate system (px) */
  ceilingPx: number
}

const PlayfieldMetricsContext = React.createContext<PlayfieldMetrics>({
  hudBottomPx: 0,
  ceilingPx: 0,
})

export function PlayfieldMetricsProvider({
  value,
  children,
}: {
  value: PlayfieldMetrics
  children: React.ReactNode
}) {
  return (
    <PlayfieldMetricsContext.Provider value={value}>
      {children}
    </PlayfieldMetricsContext.Provider>
  )
}

export function usePlayfieldMetrics() {
  return React.useContext(PlayfieldMetricsContext)
}
