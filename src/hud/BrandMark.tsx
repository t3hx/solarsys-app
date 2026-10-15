/**
 * @module hud/BrandMark
 * @description Logo discret dans le coin bas droit de l'ecran, hors du cadre HUD, a
 * droite du triangle de vue tactique. Dimensionne par l'echelle du cadre (hudScale),
 * comme les coins : il retrecit avec eux. Visible uniquement en phase scene.
 * Les PNG sont generes avec une vraie couche alpha (voir la PR) : aucun blend mode.
 */
import styles from '@/hud/BrandMark.module.css'
import { useAppStore } from '@/store/app'

export interface BrandMarkProps {
  /** Marge du cadre HUD en pixels (deja mise a l'echelle) */
  margin: number
  /** Echelle du cadre (hudScale), celle des coins */
  scale: number
}

export function BrandMark({ margin, scale }: BrandMarkProps) {
  const phase = useAppStore((state) => state.phase)
  if (phase !== 'scene') return null

  const size = 48 * scale
  const offset = margin * 0.4
  return (
    <img
      className={styles.brandMark}
      src="/solarsys-logo.png"
      alt="solarsys logo"
      style={{ width: size, height: size, right: offset, bottom: offset }}
    />
  )
}
