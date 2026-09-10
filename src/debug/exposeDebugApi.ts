/**
 * @module debug/exposeDebugApi
 * @description API de pilotage exposee sur `window.solarsys`, uniquement quand le build est
 * fait avec `VITE_EXPOSE_DEBUG_API=1` (tests end-to-end, captures). Absente en production.
 */
import { gsap } from 'gsap'
import type { Scene } from 'three'
import { useInteractionStore } from '@/store/interaction'
import { useSimulationStore } from '@/store/simulation'

export interface SolarsysDebugApi {
  select: (id: string | null) => void
  toggleTactical: () => void
  setSpeed: (speed: number) => void
  /** Place la camera a une distance donnee de sa cible (renseigne par CameraRig) */
  setDistance?: (distance: number) => void
  /** Tourne la camera autour de sa cible, angles en radians (renseigne par CameraRig) */
  rotateCamera?: (azimuth: number, polar: number) => void
  /** Statistiques de la scene (renseigne par SceneStatsProbe une fois le canvas monte) */
  stats?: () => unknown
  /** Graphe de scene Three (renseigne par SceneStatsProbe) */
  scene?: () => Scene
}

declare global {
  interface Window {
    solarsys?: SolarsysDebugApi
  }
}

export function isDebugApiEnabled(): boolean {
  return import.meta.env.VITE_EXPOSE_DEBUG_API === '1'
}

export function exposeDebugApi(): void {
  if (!isDebugApiEnabled()) return
  // * Rendu logiciel headless : des frames longues feraient avancer les tweens de 33 ms par
  // * frame (lag smoothing). Desactive pour des transitions calees sur le temps reel.
  gsap.ticker.lagSmoothing(0)
  window.solarsys = {
    select: (id) => useInteractionStore.getState().select(id),
    toggleTactical: () => useInteractionStore.getState().toggleTactical(),
    setSpeed: (speed) => useSimulationStore.getState().setSpeed(speed),
  }
}
