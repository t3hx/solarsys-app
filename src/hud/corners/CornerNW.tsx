/**
 * @module hud/corners/CornerNW
 * @description Coin nord-ouest : bouton MENU vertical qui ouvre le tiroir.
 */
import { useTranslation } from 'react-i18next'
import styles from '@/hud/corners/corners.module.css'
import type { Box } from '@/hud/hudLayout'
import { cornerSizes } from '@/hud/hudLayout'

const LETTERS = [
  ['M', 40],
  ['E', 40],
  ['N', 41],
  ['U', 39],
] as const

export function CornerNW({ box, onClick }: { box: Box; onClick: () => void }) {
  const { t } = useTranslation()
  const { width, height } = cornerSizes.nw
  return (
    <svg
      className={`${styles.corner} ${styles.button} ${styles.menuButton}`}
      style={{ left: box.x, top: box.y, width: box.width, height: box.height }}
      viewBox={`0 0 ${width} ${height}`}
      role="button"
      tabIndex={0}
      aria-label={t('hud.menu')}
      data-tutorial-target="menu"
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onClick()
        }
      }}
    >
      <path
        className={styles.menuBackground}
        d="M60 20L20 60V270M60 20V230L20 270M60 20L80 0M20 270L0 290"
      />
      <path
        d="M10 0H0V10"
        strokeOpacity={0.5}
        strokeWidth={3}
        strokeLinecap="square"
      />
      <text
        className={styles.menuText}
        y={86}
        aria-hidden="true"
      >
        {LETTERS.map(([letter, x]) => (
          <tspan
            key={letter}
            x={x}
            dy="1.2em"
          >
            {letter}
          </tspan>
        ))}
      </text>
    </svg>
  )
}
