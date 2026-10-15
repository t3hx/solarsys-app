/**
 * @module windows/InfoWindow/formatters
 * @description Mise en forme des grandeurs physiques pour la fenetre d'information.
 */
import type { DisplayDuration } from '@/data/model'
import { EARTH_MASS_KG, kmToAu } from '@/physics/units'

const SUPERSCRIPT_DIGITS = '⁰¹²³⁴⁵⁶⁷⁸⁹'
const SCIENTIFIC_THRESHOLD = 1e15
const GROUPING_THRESHOLD = 1e6

function toSuperscript(exponent: number): string {
  const sign = exponent < 0 ? '⁻' : ''
  return sign + String(Math.abs(exponent)).replace(/\d/g, (d) => SUPERSCRIPT_DIGITS[Number(d)]!)
}

/** ~ Notation scientifique au-dela de 10¹⁵, separateurs de milliers au-dela d'un million. */
export function formatNumber(value: number): string {
  if (Math.abs(value) >= SCIENTIFIC_THRESHOLD) {
    const [mantissa, exponent] = value.toExponential().split('e')
    return `${mantissa} × 10${toSuperscript(Number(exponent))}`
  }
  if (Math.abs(value) >= GROUPING_THRESHOLD) return value.toLocaleString('en-US')
  return String(value)
}

export function formatEarthMasses(kg: number): string {
  const masses = kg / EARTH_MASS_KG
  if (masses >= 1000) return `${Math.round(masses).toLocaleString('en-US')} M⊕`
  if (masses >= 10) return `${masses.toFixed(1)} M⊕`
  if (masses >= 1) return `${masses.toFixed(2)} M⊕`
  if (masses >= 0.01) return `${masses.toFixed(3)} M⊕`
  return `${masses.toExponential(2)} M⊕`
}

export function formatAu(km: number): string {
  const au = kmToAu(km)
  if (au >= 100) return `${Math.round(au)} AU`
  if (au >= 10) return `${au.toFixed(1)} AU`
  return `${au.toFixed(2)} AU`
}

/** ~ Badge de comparaison avec la Terre : ≈×1, ×318, ÷2.6, ×3K, ÷10M. */
export function formatEarthRatio(ratio: number | undefined): string {
  if (ratio === undefined || !(ratio > 0)) return ''
  if (ratio >= 0.95 && ratio <= 1.05) return '≈×1'
  const smaller = ratio < 1
  const value = smaller ? 1 / ratio : ratio
  const prefix = smaller ? '÷' : '×'
  if (value >= 1_000_000) return `${prefix}${Math.round(value / 1_000_000)}M`
  if (value >= 1_000) return `${prefix}${Math.round(value / 1_000)}K`
  if (value >= 100) return `${prefix}${Math.round(value)}`
  return `${prefix}${value.toFixed(1)}`
}

export function formatPeriod(duration: DisplayDuration, t: (key: string) => string): string {
  return `${duration.value} ${t(`metrics.${duration.unit}`)}`
}
