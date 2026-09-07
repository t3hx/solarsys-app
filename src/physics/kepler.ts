/**
 * @module physics/kepler
 * @description Mecanique keplerienne pure : resolution de l'equation de Kepler
 * (M = E - e sin E) par Newton-Raphson, conversion en anomalie vraie et position
 * d'un corps sur son plan orbital a un instant donne.
 *
 * Conventions :
 * - Le foyer (corps central) est a l'origine du plan orbital.
 * - Le plan orbital est le plan XZ ; Z est negatif pour un mouvement prograde
 *   (anti-horaire vu depuis +Y), comme dans la version Vue.
 * - Le temps simule est exprime en jours, les angles en radians.
 */

export interface KeplerianOrbit {
  /** Demi-grand axe, en unites de scene (deja mis a l'echelle) */
  semiMajorAxis: number
  /** Excentricite, 0 <= e < 1 */
  eccentricity: number
  /** Argument du perihelie, en radians */
  argOfPerihelion: number
  /** Anomalie moyenne a l'epoque, en radians */
  meanAnomalyAtEpoch: number
  /** Periode orbitale, en jours simules */
  periodDays: number
}

export interface PlanePosition {
  x: number
  z: number
}

/** En dessous de cette excentricite, l'orbite est traitee comme un cercle. */
export const CIRCULAR_EPSILON = 1e-6

/**
 * ~ Resout M = E - e sin E par Newton-Raphson.
 * Converge en 3 a 5 iterations pour les excentricites du systeme solaire.
 */
export function solveKepler(
  meanAnomaly: number,
  eccentricity: number,
  tolerance = 1e-8,
  maxIterations = 30,
): number {
  let eccentricAnomaly = meanAnomaly
  for (let i = 0; i < maxIterations; i++) {
    const delta =
      (eccentricAnomaly - eccentricity * Math.sin(eccentricAnomaly) - meanAnomaly) /
      (1 - eccentricity * Math.cos(eccentricAnomaly))
    eccentricAnomaly -= delta
    if (Math.abs(delta) < tolerance) break
  }
  return eccentricAnomaly
}

/** ~ Anomalie excentrique → anomalie vraie. */
export function eccentricToTrueAnomaly(eccentricAnomaly: number, eccentricity: number): number {
  return (
    2 *
    Math.atan2(
      Math.sqrt(1 + eccentricity) * Math.sin(eccentricAnomaly / 2),
      Math.sqrt(1 - eccentricity) * Math.cos(eccentricAnomaly / 2),
    )
  )
}

/** ~ Anomalie moyenne a l'instant t : M = M0 + n t, avec n = 2 pi / periode. */
export function meanAnomalyAt(orbit: KeplerianOrbit, timeDays: number): number {
  const meanMotion = (2 * Math.PI) / orbit.periodDays
  return orbit.meanAnomalyAtEpoch + timeDays * meanMotion
}

/**
 * ~ Position sur le plan orbital a l'instant t.
 * `out` permet de reutiliser un objet et d'eviter toute allocation dans la boucle de rendu.
 */
export function orbitalPosition(
  orbit: KeplerianOrbit,
  timeDays: number,
  out: PlanePosition = { x: 0, z: 0 },
): PlanePosition {
  const { semiMajorAxis, eccentricity, argOfPerihelion } = orbit
  const meanAnomaly = meanAnomalyAt(orbit, timeDays)

  if (eccentricity < CIRCULAR_EPSILON) {
    const angle = meanAnomaly + argOfPerihelion
    out.x = Math.cos(angle) * semiMajorAxis
    out.z = -Math.sin(angle) * semiMajorAxis
    return out
  }

  const eccentricAnomaly = solveKepler(meanAnomaly, eccentricity)
  const trueAnomaly = eccentricToTrueAnomaly(eccentricAnomaly, eccentricity)
  const radius = semiMajorAxis * (1 - eccentricity * Math.cos(eccentricAnomaly))
  const angle = trueAnomaly + argOfPerihelion
  out.x = Math.cos(angle) * radius
  out.z = -Math.sin(angle) * radius
  return out
}
