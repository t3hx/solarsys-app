/**
 * @module scene/sceneTextures
 * @description Ensemble des textures distinctes referencees par les materiaux d'une
 * arborescence (toute propriete de materiau qui est une `Texture`).
 */
import type { Material, Object3D, Texture } from 'three'

function texturesOf(material: Material): Texture[] {
  return Object.values(material as unknown as Record<string, unknown>).filter(
    (value): value is Texture =>
      typeof value === 'object' && value !== null && (value as Texture).isTexture === true,
  )
}

export function collectSceneTextures(root: Object3D): Set<Texture> {
  const seen = new Set<Texture>()
  root.traverse((object) => {
    const material = (object as { material?: Material | Material[] }).material
    if (!material) return
    for (const item of Array.isArray(material) ? material : [material]) {
      for (const texture of texturesOf(item)) seen.add(texture)
    }
  })
  return seen
}
