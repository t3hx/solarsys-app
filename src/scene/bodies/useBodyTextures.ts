/**
 * @module scene/bodies/useBodyTextures
 * @description Charge en un seul lot (Suspense) les textures pleine resolution qu'un corps
 * declare. Tout est charge pendant le prechargeur, puis envoye au GPU par `SceneReadyMarker`
 * avant l'affichage de la scene : aucun chargement ni transfert pendant l'utilisation.
 * Reglages communs (espace colorimetrique, anisotropie) dans `textureSettings`.
 */
import { useTexture } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useMemo } from 'react'
import type { Texture } from 'three'
import type { Body } from '@/data/model'
import type { TextureKey } from '@/scene/bodies/textureSettings'
import { configureBodyTexture } from '@/scene/bodies/textureSettings'

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

/** ~ Filtrage anisotrope maximal du renderer (1 si indisponible, ex : tests). */
export function useMaxAnisotropy(): number {
  return useThree((state) => {
    const capabilities = state.gl.capabilities as { getMaxAnisotropy?: () => number } | undefined
    return capabilities?.getMaxAnisotropy?.() ?? 1
  })
}

export function useBodyTextures(body: Body): LoadedBodyTextures {
  const anisotropy = useMaxAnisotropy()
  const keys = useMemo(() => LOAD_ORDER.filter((key) => body.textures[key]), [body])
  const urls = useMemo(() => keys.map((key) => body.textures[key]!), [keys, body])

  const loaded = useTexture(urls, (textures) => {
    const list = Array.isArray(textures) ? textures : [textures]
    list.forEach((texture, index) => configureBodyTexture(texture, keys[index]!, anisotropy))
  })

  return useMemo(() => {
    const result: LoadedBodyTextures = {}
    keys.forEach((key, index) => {
      result[key] = loaded[index]
    })
    return result
  }, [keys, loaded])
}
