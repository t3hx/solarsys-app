/**
 * @module data/useSolarSystem
 * @description Chargement du systeme solaire au montage, avec etats de chargement et d'erreur.
 */
import { useEffect, useState } from 'react'
import { loadSolarSystem } from '@/data/loadSolarSystem'
import type { SolarSystem } from '@/data/model'

export type SolarSystemLoadState =
  | { status: 'loading' }
  | { status: 'ready'; system: SolarSystem }
  | { status: 'error'; message: string }

export function useSolarSystem(): SolarSystemLoadState {
  const [state, setState] = useState<SolarSystemLoadState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    loadSolarSystem()
      .then((system) => {
        if (!cancelled) setState({ status: 'ready', system })
      })
      .catch((error: unknown) => {
        if (cancelled) return
        const message = error instanceof Error ? error.message : String(error)
        setState({ status: 'error', message })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
