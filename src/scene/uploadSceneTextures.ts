/**
 * @module scene/uploadSceneTextures
 * @description Envoie au GPU toutes les textures de la scene avant son affichage. Sans cela,
 * Three ne transfere une texture qu'au premier rendu qui l'utilise : le premier cadrage
 * d'un corps (textures 8K) bloquait l'animation de focus pendant le transfert.
 */
import type { Object3D, Texture } from 'three'
import { collectSceneTextures } from '@/scene/sceneTextures'

export interface TextureUploader {
  initTexture: (texture: Texture) => void
}

/** ~ Renvoie le nombre de textures transferees. */
export function uploadSceneTextures(gl: TextureUploader, root: Object3D): number {
  const textures = collectSceneTextures(root)
  for (const texture of textures) gl.initTexture(texture)
  return textures.size
}
