/**
 * @module hud/zoom/zoomState
 * @description Niveau de zoom discret et mode d'affichage de l'indicateur, derives de la
 * distance camera-cible. Pure, sans dependance a Three ni React.
 */
import { zoomThresholds, zoomVoidMargin } from '@/config/zoom'
import { controlsConfig } from '@/config/scene'

export type ZoomMode = 'normal' | 'max' | 'outOfRange' | 'void'

export interface ZoomModeOptions {
  thresholds: readonly number[]
  maxDistance: number
  voidMargin: number
}

const defaultOptions: ZoomModeOptions = {
  thresholds: zoomThresholds,
  maxDistance: controlsConfig.maxDistance,
  voidMargin: zoomVoidMargin,
}

/** ~ Niveau de 0 (au-dela du dernier seuil) a `thresholds.length` (sous le premier). */
export function zoomLevelFromDistance(
  distance: number,
  thresholds: readonly number[] = zoomThresholds,
): number {
  const index = thresholds.findIndex((threshold) => distance < threshold)
  return index === -1 ? 0 : thresholds.length - index
}

export function zoomModeFromDistance(
  distance: number,
  options: ZoomModeOptions = defaultOptions,
): ZoomMode {
  const { thresholds, maxDistance, voidMargin } = options
  if (distance >= maxDistance - voidMargin) return 'void'
  if (distance <= thresholds[0]!) return 'max'
  if (distance > thresholds[thresholds.length - 1]!) return 'outOfRange'
  return 'normal'
}
