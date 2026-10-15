/**
 * @module hud/BrandMark
 * @description Logo dans le coin bas droit de l'ecran, hors du cadre HUD : centre dans la
 * zone triangulaire libre entre la ligne decorative du coin SE (parallele a l'hypotenuse,
 * voir CornerSE) et l'angle de l'ecran. Le centre et la taille viennent du cercle inscrit
 * de cette zone, en unites du viewBox SE (130×124), donc tout suit l'echelle du cadre.
 * Visible uniquement en phase scene. Les PNG ont une vraie couche alpha : aucun blend mode.
 */
import styles from '@/hud/BrandMark.module.css'
import type { Box } from '@/hud/hudLayout'
import { cornerSizes } from '@/hud/hudLayout'
import { useAppStore } from '@/store/app'

export interface BrandMarkProps {
  /** Marge du cadre HUD en pixels (deja mise a l'echelle) */
  margin: number
  /** Boite du coin SE, pour l'echelle et l'ancrage au coin du cadre */
  seBox: Box
}

// ~ Cercle inscrit du triangle libre (ligne deco → angle du coin), unites viewBox SE
const INSCRIBED_RADIUS = 28.7
const LOGO_SIZE = 52

export function BrandMark({ margin, seBox }: BrandMarkProps) {
  const phase = useAppStore((state) => state.phase)
  if (phase !== 'scene') return null

  const unit = seBox.width / cornerSizes.se.width
  const size = LOGO_SIZE * unit
  // ~ Centre du logo sur le centre du cercle inscrit, a INSCRIBED_RADIUS du coin du cadre
  const offset = margin + (INSCRIBED_RADIUS - LOGO_SIZE / 2) * unit
  return (
    <img
      className={styles.brandMark}
      src="/solarsys-logo.png"
      alt="solarsys logo"
      style={{ width: size, height: size, right: offset, bottom: offset }}
    />
  )
}
