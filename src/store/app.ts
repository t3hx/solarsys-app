/**
 * @module store/app
 * @description Phases de l'application (prechargement → tutoriel → scene) et disponibilite
 * de la scene 3D (textures chargees, Suspense resolu).
 */
import { create } from 'zustand'

export type AppPhase = 'preloading' | 'tutorial' | 'scene'

export interface AppState {
  phase: AppPhase
  sceneReady: boolean
  setSceneReady: (ready: boolean) => void
  finishPreloading: (options: { tutorialSeen: boolean }) => void
  finishTutorial: () => void
  reset: () => void
}

const initialState = { phase: 'preloading' as AppPhase, sceneReady: false }

export const useAppStore = create<AppState>()((set) => ({
  ...initialState,
  setSceneReady: (ready) => set({ sceneReady: ready }),
  finishPreloading: ({ tutorialSeen }) =>
    set((state) =>
      state.phase === 'preloading' ? { phase: tutorialSeen ? 'scene' : 'tutorial' } : state,
    ),
  finishTutorial: () => set((state) => (state.phase === 'tutorial' ? { phase: 'scene' } : state)),
  reset: () => set(initialState),
}))
