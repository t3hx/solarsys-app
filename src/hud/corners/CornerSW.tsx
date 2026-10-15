/**
 * @module hud/corners/CornerSW
 * @description Coin sud-ouest : nom du corps survole ou selectionne (traduit), « TARGET » sinon.
 */
import { useTranslation } from 'react-i18next'
import type { SolarSystem } from '@/data/model'
import styles from '@/hud/corners/corners.module.css'
import type { Box } from '@/hud/hudLayout'
import { cornerSizes } from '@/hud/hudLayout'
import { bodyDisplayName } from '@/i18n'
import { useInteractionStore } from '@/store/interaction'

export function CornerSW({ box, system }: { box: Box; system: SolarSystem }) {
  // * Re-rendu au changement de langue
  useTranslation()
  const targetId = useInteractionStore((state) => state.selectedId ?? state.hoveredId)
  const body = targetId ? system.byId.get(targetId) : undefined
  const name = body ? bodyDisplayName(body.id, body.name) : 'Target'
  const { width, height } = cornerSizes.sw

  return (
    <svg
      className={styles.corner}
      style={{ left: box.x, top: box.y, width: box.width, height: box.height }}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      <path d="M0 0H240.086L280 40H40L0 0Z" />
      <path
        d="M0 30V40H10"
        strokeOpacity={0.5}
        strokeWidth={3}
        strokeLinecap="square"
      />
      <text
        key={name}
        className={styles.targetText}
        x={140}
        y={22}
        textAnchor="middle"
        dominantBaseline="middle"
        data-testid="target-name"
      >
        {name.toUpperCase()}
      </text>
    </svg>
  )
}
