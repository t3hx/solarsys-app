/**
 * @module windows/InfoWindow/buildMetrics
 * @description Liste des metriques affichees pour un corps, construite depuis le modele
 * normalise (plus de constantes dupliquees, audit A7). Les ratios sont calcules par rapport
 * a la Terre, jamais pour la Terre elle-meme.
 */
import type { i18n as I18n } from 'i18next'
import type { Body } from '@/data/model'
import {
  formatAu,
  formatEarthMasses,
  formatNumber,
  formatPeriod,
} from '@/windows/InfoWindow/formatters'

export interface Metric {
  icon: string
  label: string
  value: string
  detail?: string
  earthRatio?: number
}

const AU_DISPLAY_THRESHOLD_KM = 1_000_000

export function buildMetrics(body: Body, earth: Body | undefined, i18n: I18n): Metric[] {
  const t = (key: string, options: Record<string, unknown> = {}) => i18n.t(key, options)
  const compare = body.id === earth?.id ? undefined : earth
  const ratio = (value: number | undefined, reference: number | undefined) =>
    value !== undefined && reference ? Math.abs(value) / Math.abs(reference) : undefined
  const items: Metric[] = []

  if (body.rank && body.rank > 0) {
    items.push({
      icon: 'solar:medal-ribbons-star-broken',
      label: t('metrics.rank'),
      value: t('metrics.ordinal', { rank: body.rank }),
    })
  }
  if (i18n.exists(`bodies.${body.id}.type`)) {
    items.push({
      icon: 'solar:tag-broken',
      label: t('metrics.type'),
      value: t(`bodies.${body.id}.type`),
    })
  }

  items.push({
    icon: 'solar:ruler-angular-broken',
    label: t('metrics.radius'),
    value: `${formatNumber(body.radiusKm)} km`,
    ...withRatio(ratio(body.radiusKm, compare?.radiusKm)),
  })
  items.push({
    icon: 'solar:sledgehammer-broken',
    label: t('metrics.mass'),
    value: formatEarthMasses(body.massKg),
    detail: `${formatNumber(body.massKg)} kg`,
  })
  items.push({
    icon: 'solar:box-broken',
    label: t('metrics.density'),
    value: `${formatNumber(body.densityKgM3)} kg/m³`,
    ...withRatio(ratio(body.densityKgM3, compare?.densityKgM3)),
  })
  items.push({
    icon: 'solar:magnet-broken',
    label: t('metrics.gravity'),
    value: `${body.surfaceGravityG} G`,
    ...withRatio(ratio(body.surfaceGravityG, compare?.surfaceGravityG)),
  })

  if (body.orbit) {
    const km = body.orbit.semiMajorAxisKm
    const useAu = km >= AU_DISPLAY_THRESHOLD_KM
    items.push({
      icon: 'solar:sun-broken',
      label: t('metrics.distanceToSun'),
      value: useAu ? formatAu(km) : `${formatNumber(km)} km`,
      ...(useAu ? { detail: `${formatNumber(km)} km` } : {}),
      ...withRatio(ratio(km, compare?.orbit?.semiMajorAxisKm)),
    })
    items.push({
      icon: 'solar:planet-3-broken',
      label: t('metrics.orbitalPeriod'),
      value: formatPeriod(body.orbit.periodDisplay, t),
      ...withRatio(ratio(body.orbit.periodDays, compare?.orbit?.periodDays)),
    })
  }

  if (body.lengthOfDayDisplay) {
    items.push({
      icon: 'solar:clock-circle-broken',
      label: t('metrics.dayLength'),
      value: formatPeriod(body.lengthOfDayDisplay, t),
      ...withRatio(ratio(body.lengthOfDayHours, compare?.lengthOfDayHours)),
    })
  }
  if (body.rotationDirection) {
    items.push({
      icon: 'solar:refresh-broken',
      label: t('metrics.rotation'),
      value: t(`metrics.${body.rotationDirection}`),
    })
  }

  const temperature = body.temperature
  if (temperature?.meanC !== undefined) {
    const { minC, maxC, meanC } = temperature
    const hasRange = minC !== undefined && maxC !== undefined && minC !== maxC
    items.push({
      icon: 'solar:temperature-broken',
      label: t('metrics.temperature'),
      value: hasRange ? `${minC}/${maxC}°C` : `${meanC}°C`,
    })
  }
  if (i18n.exists(`bodies.${body.id}.winds`)) {
    items.push({
      icon: 'solar:wind-broken',
      label: t('metrics.winds'),
      value: t(`bodies.${body.id}.winds`),
    })
  }
  if (i18n.exists(`bodies.${body.id}.seasons`)) {
    items.push({
      icon: 'solar:leaf-broken',
      label: t('metrics.seasons'),
      value: t(`bodies.${body.id}.seasons`),
    })
  }
  if (body.knownMoons !== undefined && body.knownMoons >= 0) {
    items.push({
      icon: 'solar:moon-broken',
      label: t('metrics.moons'),
      value: body.knownMoons > 0 ? String(body.knownMoons) : t('metrics.none'),
    })
  }
  items.push({
    icon: 'solar:atom-broken',
    label: t('metrics.rings'),
    value: body.rings ? t('metrics.yes') : t('metrics.no'),
  })

  return items
}

function withRatio(earthRatio: number | undefined): { earthRatio?: number } {
  return earthRatio === undefined ? {} : { earthRatio }
}
