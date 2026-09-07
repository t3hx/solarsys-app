/**
 * @module windows/useDelayedUnmount
 * @description Garde un element monte le temps de son animation de fermeture.
 */
import { useEffect, useState } from 'react'

export interface DelayedUnmount {
  mounted: boolean
  closing: boolean
}

export function useDelayedUnmount(open: boolean, delayMs: number): DelayedUnmount {
  const [mounted, setMounted] = useState(open)
  // * Etat derive pendant le rendu : ouverture immediate
  if (open && !mounted) setMounted(true)

  useEffect(() => {
    if (open) return undefined
    const timeout = window.setTimeout(() => setMounted(false), delayMs)
    return () => window.clearTimeout(timeout)
  }, [open, delayMs])

  return { mounted, closing: mounted && !open }
}
