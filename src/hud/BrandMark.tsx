/**
 * @module hud/BrandMark
 * @description Logo discret en bas a droite, face au bouton de vue tactique, hors du
 * cadre HUD. Visible uniquement en phase scene (jamais pendant le preloader ni le
 * tutoriel).
 */
import styles from '@/hud/BrandMark.module.css'
import type { Box } from '@/hud/hudLayout'
import { useAppStore } from '@/store/app'

export interface BrandMarkProps {
  margin: number
  seBox: Box
  scale: number
}

export function BrandMark({ margin, seBox, scale }: BrandMarkProps) {
  const phase = useAppStore((state) => state.phase)
  if (phase !== 'scene') return null

  const size = 44 * scale
  return (
    <img
      className={styles.brandMark}
      src="/solarsys-logo.png"
      alt="solarsys logo"
      style={{
        width: size,
        height: size,
        right: margin + seBox.width + 16 * scale,
        bottom: margin,
      }}
    />
  )
}
