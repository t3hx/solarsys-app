/**
 * @module scene/bodies/useColorTexture
 * @description Charge une texture couleur (Suspense via drei) en espace sRGB, requis
 * depuis Three r152 pour un rendu des couleurs correct.
 */
import { useTexture } from '@react-three/drei'
import type { Texture } from 'three'
import { SRGBColorSpace } from 'three'

function markAsColor(loaded: Texture | Texture[]) {
  for (const texture of Array.isArray(loaded) ? loaded : [loaded]) {
    texture.colorSpace = SRGBColorSpace
  }
}

export function useColorTexture(url: string): Texture {
  return useTexture(url, markAsColor)
}
