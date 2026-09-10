/**
 * @module scene/orbits/orbitGeometry
 * @description Points de la trajectoire orbitale (ellipse, foyer a l'origine, tournee
 * par l'argument du perihelie), pretes pour un attribut `position` de BufferGeometry.
 * Meme parametrage que `physics/kepler` : plan XZ, Z negatif pour le sens prograde.
 */
import { orbitLineDefaults } from '@/config/rendering'

/**
 * ~ Nombre de segments pour qu'une corde de la polyligne ne s'ecarte pas de l'ellipse de
 * plus d'une fraction du rayon du corps : fleche d'une corde = a (1 - cos(pi / n)).
 * Sans cela, une resolution fixe laisse les corps lointains (Pluton, Eris...) visiblement
 * a cote de leur ligne d'orbite une fois cadres de pres.
 */
export function orbitLineResolution(semiMajorAxis: number, bodyRadius: number): number {
  const { minResolution, maxResolution, maxDeviationRatio } = orbitLineDefaults
  const maxDeviation = bodyRadius * maxDeviationRatio
  if (semiMajorAxis <= 0 || maxDeviation >= 2 * semiMajorAxis) return minResolution
  const segments = Math.ceil(Math.PI / Math.acos(1 - maxDeviation / semiMajorAxis))
  return Math.min(maxResolution, Math.max(minResolution, segments))
}

export function ellipsePoints(
  semiMajorAxis: number,
  eccentricity: number,
  argOfPerihelion: number,
  resolution = 512,
): Float32Array {
  const semiMinorAxis = semiMajorAxis * Math.sqrt(1 - eccentricity * eccentricity)
  const focalOffset = semiMajorAxis * eccentricity
  const cosW = Math.cos(argOfPerihelion)
  const sinW = Math.sin(argOfPerihelion)

  const points = new Float32Array((resolution + 1) * 3)
  for (let i = 0; i <= resolution; i++) {
    const theta = (i / resolution) * 2 * Math.PI
    // * Ellipse centree sur son centre geometrique, puis decalee pour mettre le foyer a l'origine
    const xEllipse = semiMajorAxis * Math.cos(theta) - focalOffset
    const zEllipse = semiMinorAxis * Math.sin(theta)
    points[i * 3] = xEllipse * cosW - zEllipse * sinW
    points[i * 3 + 1] = 0
    points[i * 3 + 2] = -(xEllipse * sinW + zEllipse * cosW)
  }
  return points
}
