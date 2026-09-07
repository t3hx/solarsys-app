/**
 * @module debug/exposeDebugApi
 * @description API de pilotage exposee sur `window.solarsys`, uniquement quand le build est
 * fait avec `VITE_EXPOSE_DEBUG_API=1` (tests end-to-end, captures). Absente en production.
 */
import { gsap } from 'gsap'
import { useInteractionStore } from '@/store/interaction'
import { useSimulationStore } from '@/store/simulation'

export interface SolarsysDebugApi {
  select: (id: string | null) => void
  toggleTactical: () => void
  setSpeed: (speed: number) => void
}

declare global {
  interface Window {
    solarsys?: SolarsysDebugApi
  }
}

export function exposeDebugApi(): void {
  if (import.meta.env.VITE_EXPOSE_DEBUG_API !== '1') return
  // * Rendu logiciel headless : des frames longues feraient avancer les tweens de 33 ms par
  // * frame (lag smoothing). Desactive pour des transitions calees sur le temps reel.
  gsap.ticker.lagSmoothing(0)
  window.solarsys = {
    select: (id) => useInteractionStore.getState().select(id),
    toggleTactical: () => useInteractionStore.getState().toggleTactical(),
    setSpeed: (speed) => useSimulationStore.getState().setSpeed(speed),
  }
}
