/**
 * @module hud/corners/CornerNE
 * @description Coin nord-est, decoratif.
 */
import styles from '@/hud/corners/corners.module.css'
import type { Box } from '@/hud/hudLayout'
import { cornerSizes } from '@/hud/hudLayout'

export function CornerNE({ box }: { box: Box }) {
  const { width, height } = cornerSizes.ne
  return (
    <svg
      className={styles.corner}
      style={{ left: box.x, top: box.y, width: box.width, height: box.height }}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      <path d="M0 0L40 40" />
      <path
        d="M40 10V0H30"
        strokeOpacity={0.5}
        strokeWidth={3}
        strokeLinecap="square"
      />
    </svg>
  )
}
