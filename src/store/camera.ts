/**
 * @module store/camera
 * @description Niveau et mode de zoom discrets derives de la distance camera-cible et de la
 * distance minimale atteignable pour la cible courante. `updateFromDistance` est appelee a
 * chaque frame par CameraRig mais ne publie un nouvel etat que lorsque le niveau ou le mode
 * change : l'interface ne re-rend pas a 60 fps.
 */
import { create } from 'zustand'
import { cameraConfig } from '@/config/scene'
import { starRadiusToUnits } from '@/physics/scaling'
import { followMinDistance } from '@/scene/camera/cameraDirector'
import type { ZoomMode } from '@/hud/zoom/zoomState'
import { zoomLevelFromDistance, zoomModeFromDistance } from '@/hud/zoom/zoomState'

export interface CameraState {
  zoomLevel: number
  zoomMode: ZoomMode
  updateFromDistance: (distance: number, minDistance: number) => void
  reset: () => void
}

const SUN_RADIUS_KM = 696_340
const homeDistance = Math.hypot(...cameraConfig.initialPosition)
const homeMinDistance = followMinDistance(starRadiusToUnits(SUN_RADIUS_KM))

const initialState = {
  zoomLevel: zoomLevelFromDistance(homeDistance, { minDistance: homeMinDistance }),
  zoomMode: zoomModeFromDistance(homeDistance, { minDistance: homeMinDistance }),
}

export const useCameraStore = create<CameraState>()((set, get) => ({
  ...initialState,
  updateFromDistance: (distance, minDistance) => {
    const zoomLevel = zoomLevelFromDistance(distance, { minDistance })
    const zoomMode = zoomModeFromDistance(distance, { minDistance })
    const current = get()
    if (current.zoomLevel === zoomLevel && current.zoomMode === zoomMode) return
    set({ zoomLevel, zoomMode })
  },
  reset: () => set(initialState),
}))
