/**
 * @module scene/SceneReadyMarker
 * @description Une fois la scene montee (textures chargees, Suspense resolu), envoie toutes
 * les textures au GPU puis signale que la scene est prete : drapeau `sceneReady` du store
 * d'application (prechargeur) et attribut `data-scene-ready` sur le conteneur du canvas
 * (tests end-to-end). Le transfert GPU se fait ainsi derriere le prechargeur, jamais
 * pendant l'utilisation.
 */
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { uploadSceneTextures } from '@/scene/uploadSceneTextures'
import { useAppStore } from '@/store/app'

export const SCENE_READY_ATTRIBUTE = 'data-scene-ready'

export function SceneReadyMarker() {
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)
  const container = gl.domElement.parentElement

  useEffect(() => {
    uploadSceneTextures(gl, scene)
    useAppStore.getState().setSceneReady(true)
    container?.setAttribute(SCENE_READY_ATTRIBUTE, 'true')
    return () => {
      useAppStore.getState().setSceneReady(false)
      container?.removeAttribute(SCENE_READY_ATTRIBUTE)
    }
  }, [gl, scene, container])

  return null
}
