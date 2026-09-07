/**
 * @module store/simulation
 * @description Etat de la simulation temporelle : multiplicateur de vitesse et pause.
 * Lu par `SimulationDriver` via `getState()` a chaque frame (jamais par un hook dans
 * la boucle de rendu). A x1, une seconde reelle vaut un jour simule.
 */
import { create } from 'zustand'

export const timeScalePresets = [0.01, 0.1, 1, 10] as const
export type TimeScalePreset = (typeof timeScalePresets)[number]

export interface SimulationState {
  speed: number
  paused: boolean
  setSpeed: (speed: number) => void
  togglePaused: () => void
  reset: () => void
}

const initialState = { speed: 1, paused: false }

export const useSimulationStore = create<SimulationState>()((set) => ({
  ...initialState,
  setSpeed: (speed) => {
    if (!Number.isFinite(speed) || speed <= 0) return
    set({ speed })
  },
  togglePaused: () => set((state) => ({ paused: !state.paused })),
  reset: () => set(initialState),
}))
