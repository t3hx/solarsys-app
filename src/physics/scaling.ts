/**
 * @module physics/scaling
 * @description Conversions km → unites de scene, a partir des facteurs de `config/scaling`.
 */
import { scaleFactors } from '@/config/scaling'
import { kmToAu } from '@/physics/units'

export function bodyRadiusToUnits(radiusKm: number): number {
  return radiusKm / scaleFactors.celestialBodyKmPerUnit
}

export function starRadiusToUnits(radiusKm: number): number {
  return radiusKm / scaleFactors.starKmPerUnit
}

/** ~ Distance orbitale planetaire (autour du Soleil), via l'echelle en UA. */
export function orbitalDistanceToUnits(distanceKm: number): number {
  return kmToAu(distanceKm) / scaleFactors.orbitalDistanceAuPerUnit
}

/** ~ Distance orbitale locale (satellite autour de sa planete), echelle compacte. */
export function localOrbitalDistanceToUnits(distanceKm: number): number {
  return distanceKm / scaleFactors.localOrbitalDistanceKmPerUnit
}

/**
 * ~ Rayon effectif d'une orbite dans la scene : distance mise a l'echelle + rayon du
 * corps central, pour que la trajectoire passe hors du corps central.
 */
export function effectiveOrbitRadius(
  distanceKm: number,
  centralBodyRadiusUnits: number,
  options: { local?: boolean } = {},
): number {
  const scaled = options.local
    ? localOrbitalDistanceToUnits(distanceKm)
    : orbitalDistanceToUnits(distanceKm)
  return scaled + centralBodyRadiusUnits
}
