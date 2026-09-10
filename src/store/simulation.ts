/**
 * @module store/simulation
 * @description Etat de la simulation temporelle : vitesse (jours simules par seconde reelle)
 * et pause. Lu par `SimulationDriver` via `getState()` a chaque frame (jamais par un hook
 * dans la boucle de rendu). Trois presets en unites humaines : une heure, un jour ou une
 * annee simulee par seconde ; `sceneSpeed` applique celui de chaque type de scene.
 */
import { create } from 'zustand'

export type TimeScaleId = 'hour' | 'day' | 'year'

export interface TimeScalePreset {
  id: TimeScaleId
  /** Jours simules par seconde reelle */
  daysPerSecond: number
}

export const timeScalePresets: readonly TimeScalePreset[] = [
  { id: 'hour', daysPerSecond: 1 / 24 },
  { id: 'day', daysPerSecond: 1 },
  { id: 'year', daysPerSecond: 365.25 },
]

export function presetSpeed(id: TimeScaleId): number {
  return timeScalePresets.find((preset) => preset.id === id)!.daysPerSecond
}

export interface SimulationState {
  speed: number
  paused: boolean
  setSpeed: (speed: number) => void
  togglePaused: () => void
  reset: () => void
}

const initialState = { speed: presetSpeed('day'), paused: false }

export const useSimulationStore = create<SimulationState>()((set) => ({
  ...initialState,
  setSpeed: (speed) => {
    if (!Number.isFinite(speed) || speed <= 0) return
    set({ speed })
  },
  togglePaused: () => set((state) => ({ paused: !state.paused })),
  reset: () => set(initialState),
}))
