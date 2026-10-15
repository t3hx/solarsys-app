/**
 * @module scene/bodies/textureSettings
 * @description Reglages communs des textures de corps : espace colorimetrique selon le role
 * de la carte, filtrage anisotrope pour les vues rasantes.
 */
import type { Texture } from 'three'
import { SRGBColorSpace } from 'three'
import type { BodyTextures } from '@/data/model'

export type TextureKey = keyof BodyTextures

/** Cartes couleur (sRGB) ; les autres sont des donnees lineaires */
export const COLOR_MAPS: ReadonlySet<TextureKey> = new Set([
  'main',
  'day',
  'night',
  'atmosphere',
  'rings',
])

export function configureBodyTexture(texture: Texture, key: TextureKey, anisotropy: number): void {
  if (COLOR_MAPS.has(key)) texture.colorSpace = SRGBColorSpace
  if (anisotropy > 1) texture.anisotropy = anisotropy
}
