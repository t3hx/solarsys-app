/**
 * @module scene/SceneReadyMarker
 * @description Signale au DOM que la scene est montee (textures chargees, Suspense
 * resolu) via `data-scene-ready` sur le conteneur du canvas. Utilise par les tests
 * end-to-end et, plus tard, par le preloader.
 */
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'

export const SCENE_READY_ATTRIBUTE = 'data-scene-ready'

export function SceneReadyMarker() {
  const container = useThree((state) => state.gl.domElement.parentElement)

  useEffect(() => {
    if (!container) return undefined
    container.setAttribute(SCENE_READY_ATTRIBUTE, 'true')
    return () => container.removeAttribute(SCENE_READY_ATTRIBUTE)
  }, [container])

  return null
}
