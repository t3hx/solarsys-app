/**
 * @module scene/orbits/orbitAppearance
 * @description Couleur et opacite d'une ligne d'orbite selon l'etat : blanche et discrete
 * par defaut, couleur tactique du corps en vue tactique, surbrillance survol/selection
 * prioritaire dans tous les cas. Pur.
 */
import { colors, tacticalColors } from '@/config/colors'
import { orbitLineDefaults, outlineConfig } from '@/config/rendering'
import type { OutlineKind } from '@/scene/effects/outlineTarget'

export type OrbitHighlight = OutlineKind | null

export interface OrbitAppearance {
  color: string
  opacity: number
}

export function orbitAppearance(
  bodyId: string,
  highlight: OrbitHighlight,
  isTactical: boolean,
): OrbitAppearance {
  if (highlight) {
    return {
      color: highlight === 'selected' ? outlineConfig.selectedColor : outlineConfig.hoverColor,
      opacity: orbitLineDefaults.highlightOpacity,
    }
  }
  if (isTactical) {
    return {
      color: tacticalColors[bodyId] ?? colors.white,
      opacity: orbitLineDefaults.tacticalOpacity,
    }
  }
  return { color: colors.white, opacity: orbitLineDefaults.opacity }
}
