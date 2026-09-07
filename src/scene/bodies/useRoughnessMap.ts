/**
 * @module scene/bodies/useRoughnessMap
 * @description Carte de rugosite generee depuis une texture speculaire via un canvas 2D
 * (`specularToRoughness`). Le canvas et la texture sont liberes au demontage
 * (largeur/hauteur a 0, audit B9).
 */
import { useEffect, useMemo } from 'react'
import type { Texture } from 'three'
import { CanvasTexture } from 'three'
import { specularToRoughness } from '@/scene/bodies/specularToRoughness'

interface RoughnessMap {
  texture: CanvasTexture
  canvas: HTMLCanvasElement
}

function buildRoughnessMap(specular: Texture): RoughnessMap | undefined {
  const image = specular.image as { width?: number; height?: number } | undefined
  if (!image?.width || !image.height || typeof document === 'undefined') return undefined

  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height
  const context = canvas.getContext('2d')
  if (!context) return undefined

  context.drawImage(image as CanvasImageSource, 0, 0)
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
  specularToRoughness(imageData.data)
  context.putImageData(imageData, 0, 0)

  return { texture: new CanvasTexture(canvas), canvas }
}

export function useRoughnessMap(specular: Texture | undefined): Texture | undefined {
  const roughness = useMemo(() => (specular ? buildRoughnessMap(specular) : undefined), [specular])

  useEffect(() => {
    if (!roughness) return undefined
    return () => {
      roughness.texture.dispose()
      roughness.canvas.width = 0
      roughness.canvas.height = 0
    }
  }, [roughness])

  return roughness?.texture
}
