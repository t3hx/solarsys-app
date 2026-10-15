/**
 * @module scene/debug/SceneStatsProbe
 * @description Publie `window.solarsys.stats()` (textures residentes, compteurs du renderer)
 * et `window.solarsys.scene()` (graphe de scene, pour les verifications geometriques) dans les
 * builds avec API de debug.
 */
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { isDebugApiEnabled } from '@/debug/exposeDebugApi'
import { textureStats } from '@/debug/sceneStats'

export function SceneStatsProbe() {
  const scene = useThree((state) => state.scene)
  const gl = useThree((state) => state.gl)

  useEffect(() => {
    if (!isDebugApiEnabled() || !window.solarsys) return undefined
    window.solarsys.scene = () => scene
    window.solarsys.stats = () => ({
      ...textureStats(scene),
      rendererTextures: gl.info.memory.textures,
      geometries: gl.info.memory.geometries,
    })
    return () => {
      delete window.solarsys?.stats
      delete window.solarsys?.scene
    }
  }, [scene, gl])

  return null
}
