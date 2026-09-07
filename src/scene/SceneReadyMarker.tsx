/**
 * @module scene/SceneReadyMarker
 * @description Signale au DOM que la scene est montee (textures chargees, Suspense
 * resolu) : drapeau `sceneReady` du store d'application (prechargeur) et attribut
 * `data-scene-ready` sur le conteneur du canvas (tests end-to-end).
 */
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { useAppStore } from '@/store/app'

export const SCENE_READY_ATTRIBUTE = 'data-scene-ready'

export function SceneReadyMarker() {
  const container = useThree((state) => state.gl.domElement.parentElement)

  useEffect(() => {
    useAppStore.getState().setSceneReady(true)
    container?.setAttribute(SCENE_READY_ATTRIBUTE, 'true')
    return () => {
      useAppStore.getState().setSceneReady(false)
      container?.removeAttribute(SCENE_READY_ATTRIBUTE)
    }
  }, [container])

  return null
}
