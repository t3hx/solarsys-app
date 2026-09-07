/**
 * @module scene/camera/CameraRig
 * @description Controles camera libres (drei CameraControls). Le focus, le suivi, la vue
 * tactique et la distance → niveau de zoom arrivent en phase 4.
 */
import { CameraControls } from '@react-three/drei'
import { controlsConfig } from '@/config/scene'

export function CameraRig() {
  return (
    <CameraControls
      makeDefault
      minDistance={controlsConfig.minDistance}
      maxDistance={controlsConfig.maxDistance}
      maxPolarAngle={controlsConfig.maxPolarAngle}
      smoothTime={0.25}
    />
  )
}
