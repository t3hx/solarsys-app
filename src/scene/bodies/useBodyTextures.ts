/**
 * @module scene/bodies/useBodyTextures
 * @description Charge en un seul lot (Suspense) les textures qu'un corps declare, avec le
 * bon espace colorimetrique : sRGB pour les cartes couleur (surface, nuit, atmosphere,
 * anneaux), lineaire pour les cartes de donnees (normale, relief, speculaire, alpha des nuages).
 */
import { useTexture } from '@react-three/drei'
import { useMemo } from 'react'
import type { Texture } from 'three'
import { SRGBColorSpace } from 'three'
import type { Body, BodyTextures } from '@/data/model'

type TextureKey = keyof BodyTextures

const COLOR_MAPS: ReadonlySet<TextureKey> = new Set(['main', 'day', 'night', 'atmosphere', 'rings'])

const LOAD_ORDER: readonly TextureKey[] = [
  'main',
  'normal',
  'bump',
  'specular',
  'night',
  'clouds',
  'atmosphere',
  'rings',
]

export type LoadedBodyTextures = Partial<Record<TextureKey, Texture>>

export function useBodyTextures(body: Body): LoadedBodyTextures {
  const keys = useMemo(() => LOAD_ORDER.filter((key) => body.textures[key]), [body])
  const urls = useMemo(() => keys.map((key) => body.textures[key]!), [keys, body])

  const loaded = useTexture(urls, (textures) => {
    const list = Array.isArray(textures) ? textures : [textures]
    list.forEach((texture, index) => {
      if (COLOR_MAPS.has(keys[index]!)) texture.colorSpace = SRGBColorSpace
    })
  })

  return useMemo(() => {
    const result: LoadedBodyTextures = {}
    keys.forEach((key, index) => {
      result[key] = loaded[index]
    })
    return result
  }, [keys, loaded])
}
