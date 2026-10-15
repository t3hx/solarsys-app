/**
 * @module windows/InfoWindow/MetricsGrid
 * @description Grille des metriques d'un corps, avec details et badge de comparaison avec la
 * Terre au survol de chaque carte.
 */
import { Icon } from '@iconify/react'
import { useTranslation } from 'react-i18next'
import { colors } from '@/config/colors'
import type { Body } from '@/data/model'
import type { Metric } from '@/windows/InfoWindow/buildMetrics'
import { buildMetrics } from '@/windows/InfoWindow/buildMetrics'
import { formatEarthRatio } from '@/windows/InfoWindow/formatters'
import styles from '@/windows/InfoWindow/InfoWindow.module.css'

function badgeStyle(ratio: number) {
  if (ratio >= 0.95 && ratio <= 1.05) {
    return { color: colors.springGreen, background: 'rgba(0, 255, 127, 0.1)' }
  }
  return ratio > 1.05
    ? { color: colors.coral, background: 'rgba(255, 107, 107, 0.1)' }
    : { color: colors.turquoise, background: 'rgba(78, 205, 196, 0.1)' }
}

function MetricCard({ metric }: { metric: Metric }) {
  const badge = formatEarthRatio(metric.earthRatio)
  const hasDetail = Boolean(metric.detail) || badge !== ''
  return (
    <div
      className={styles.card}
      tabIndex={hasDetail ? 0 : undefined}
    >
      <Icon
        icon={metric.icon}
        className={styles.cardIcon}
      />
      <span className={styles.cardLabel}>{metric.label}</span>
      <span className={styles.cardValue}>{metric.value}</span>
      {hasDetail && (
        <div className={styles.cardDetail}>
          {metric.detail && <span className={styles.detailValue}>{metric.detail}</span>}
          {badge && (
            <>
              <span
                className={styles.badge}
                style={badgeStyle(metric.earthRatio!)}
              >
                {badge}
              </span>
              <span className={styles.badgeLabel}>vs ⊕</span>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export function MetricsGrid({ body, earth }: { body: Body; earth: Body | undefined }) {
  const { i18n } = useTranslation()
  const metrics = buildMetrics(body, earth, i18n)
  return (
    <div className={styles.grid}>
      {metrics.map((metric) => (
        <MetricCard
          key={metric.label}
          metric={metric}
        />
      ))}
    </div>
  )
}
