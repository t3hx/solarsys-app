/**
 * @module hud/zoom/zoomState
 * @description Niveau de zoom discret et mode d'affichage de l'indicateur, derives de la
 * distance camera-cible et de la distance minimale atteignable. Pure, sans Three ni React.
 *
 * - niveau 10 a la distance minimale (surface du corps suivi ou du Soleil), 0 a l'entree de
 *   la sphere d'etoiles, echelle logarithmique ;
 * - MAX a la butee ; OUT OF RANGE dans la coquille d'etoiles (clin d'oeil : on a atteint la
 *   limite du monde) ; VOID une fois sorti de la sphere, quand on la voit depuis le vide.
 */
import { starfieldConfig } from '@/config/scene'
import { zoomConfig } from '@/config/zoom'

export type ZoomMode = 'normal' | 'max' | 'outOfRange' | 'void'

export interface ZoomRange {
  /** Distance minimale atteignable par la camera pour la cible courante */
  minDistance: number
  /** Distance du niveau 0 (defaut : rayon interieur de la sphere d'etoiles) */
  farDistance?: number
}

export interface ZoomModeOptions {
  minDistance: number
  starfieldMin?: number
  starfieldMax?: number
}

export function zoomLevelFromDistance(distance: number, range: ZoomRange): number {
  const { minDistance, farDistance = starfieldConfig.minDistance } = range
  if (distance <= minDistance) return zoomConfig.levels
  if (distance >= farDistance) return 0
  const progress = Math.log(distance / minDistance) / Math.log(farDistance / minDistance)
  return Math.round(zoomConfig.levels * (1 - progress))
}

export function zoomModeFromDistance(distance: number, options: ZoomModeOptions): ZoomMode {
  const {
    minDistance,
    starfieldMin = starfieldConfig.minDistance,
    starfieldMax = starfieldConfig.maxDistance,
  } = options
  if (distance >= starfieldMax) return 'void'
  if (distance >= starfieldMin) return 'outOfRange'
  if (distance <= minDistance * zoomConfig.maxTolerance) return 'max'
  return 'normal'
}
