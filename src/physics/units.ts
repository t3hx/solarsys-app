/**
 * @module physics/units
 * @description Constantes de reference et conversions d'unites. Seule source de verite
 * pour les facteurs km/UA, masse terrestre et heures/jours/annees (l'ancienne version
 * dupliquait ces constantes entre BodyMetricsGrid et useSimulationManager).
 */

export const KM_PER_AU = 149_597_870.7
export const EARTH_MASS_KG = 5.972e24
export const HOURS_PER_DAY = 24
export const DAYS_PER_YEAR = 365.25

export type TimeUnit = 'hours' | 'days' | 'years'

const TIME_UNITS: readonly TimeUnit[] = ['hours', 'days', 'years']

/** ~ Interprete une unite textuelle du JSON, insensible a la casse, avec repli. */
export function parseTimeUnit(raw: string | undefined, fallback: TimeUnit): TimeUnit {
  const value = raw?.trim().toLowerCase()
  return TIME_UNITS.find((unit) => unit === value) ?? fallback
}

/** ~ Convertit une duree en heures (le signe est conserve : rotation retrograde). */
export function toHours(value: number, unit: TimeUnit): number {
  switch (unit) {
    case 'hours':
      return value
    case 'days':
      return value * HOURS_PER_DAY
    case 'years':
      return value * DAYS_PER_YEAR * HOURS_PER_DAY
  }
}

/** ~ Convertit une duree en jours (le signe est conserve). */
export function toDays(value: number, unit: TimeUnit): number {
  switch (unit) {
    case 'hours':
      return value / HOURS_PER_DAY
    case 'days':
      return value
    case 'years':
      return value * DAYS_PER_YEAR
  }
}

export function kmToAu(km: number): number {
  return km / KM_PER_AU
}

export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180
}

export function radToDeg(radians: number): number {
  return (radians * 180) / Math.PI
}
