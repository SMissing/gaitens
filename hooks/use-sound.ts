import { useCallback, useRef } from 'react'

type SoundSource = { src: string }

export function useSound(source: SoundSource): [() => void] {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const play = useCallback(() => {
    if (!source.src) return
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(source.src)
      }
      audioRef.current.currentTime = 0
      void audioRef.current.play().catch(() => {})
    } catch {
      /* ignore */
    }
  }, [source.src])

  return [play]
}
