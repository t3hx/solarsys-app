/**
 * @module debug/sceneStats
 * @description Estimation de la memoire occupee par les textures residentes de la scene
 * (largeur × hauteur × 4 octets × 1,33 pour les mipmaps), pour les mesures de performance.
 */
import type { Object3D } from 'three'
import { collectSceneTextures } from '@/scene/sceneTextures'

const MIPMAP_OVERHEAD = 4 / 3
const BYTES_PER_PIXEL = 4

export interface TextureStats {
  count: number
  estimatedMegabytes: number
}

export function textureStats(root: Object3D): TextureStats {
  const seen = collectSceneTextures(root)
  let bytes = 0
  for (const texture of seen) {
    const image = texture.image as { width?: number; height?: number } | undefined
    if (image?.width && image.height) {
      bytes += image.width * image.height * BYTES_PER_PIXEL * MIPMAP_OVERHEAD
    }
  }
  return { count: seen.size, estimatedMegabytes: Math.round(bytes / 1048576) }
}
