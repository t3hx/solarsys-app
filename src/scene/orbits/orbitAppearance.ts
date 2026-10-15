/**
 * @module scene/orbits/orbitAppearance
 * @description Couleur et opacite d'une ligne d'orbite selon l'etat. Hors vue tactique :
 * blanche et discrete, surbrillance survol/selection classique. En vue tactique : couleur
 * du corps ; au survol d'un corps (ligne ou etiquette), SON orbite passe a pleine
 * intensite dans sa couleur et toutes les autres s'estompent. Pur.
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
  tacticalHoveredId: string | null,
): OrbitAppearance {
  if (isTactical) {
    const color = tacticalColors[bodyId] ?? colors.white
    if (highlight === 'hover' || tacticalHoveredId === bodyId) {
      return { color, opacity: 1 }
    }
    if (tacticalHoveredId !== null) {
      return { color, opacity: orbitLineDefaults.tacticalDimmedOpacity }
    }
    return { color, opacity: orbitLineDefaults.tacticalOpacity }
  }
  if (highlight) {
    return {
      color: highlight === 'selected' ? outlineConfig.selectedColor : outlineConfig.hoverColor,
      opacity: orbitLineDefaults.highlightOpacity,
    }
  }
  return { color: colors.white, opacity: orbitLineDefaults.opacity }
}
