/**
 * @module store/camera
 * @description Niveau et mode de zoom discrets derives de la distance camera-cible.
 * `updateFromDistance` est appelee a chaque frame par CameraRig mais ne publie un
 * nouvel etat que lorsque le niveau ou le mode change : l'interface ne re-rend pas a 60 fps.
 */
import { create } from 'zustand'
import { cameraConfig } from '@/config/scene'
import type { ZoomMode } from '@/hud/zoom/zoomState'
import { zoomLevelFromDistance, zoomModeFromDistance } from '@/hud/zoom/zoomState'

export interface CameraState {
  zoomLevel: number
  zoomMode: ZoomMode
  updateFromDistance: (distance: number) => void
  reset: () => void
}

const homeDistance = Math.hypot(...cameraConfig.initialPosition)

const initialState = {
  zoomLevel: zoomLevelFromDistance(homeDistance),
  zoomMode: zoomModeFromDistance(homeDistance),
}

export const useCameraStore = create<CameraState>()((set, get) => ({
  ...initialState,
  updateFromDistance: (distance) => {
    const zoomLevel = zoomLevelFromDistance(distance)
    const zoomMode = zoomModeFromDistance(distance)
    const current = get()
    if (current.zoomLevel === zoomLevel && current.zoomMode === zoomMode) return
    set({ zoomLevel, zoomMode })
  },
  reset: () => set(initialState),
}))
