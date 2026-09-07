/**
 * @module scene/orbits/orbitGeometry
 * @description Points de la trajectoire orbitale (ellipse, foyer a l'origine, tournee
 * par l'argument du perihelie), pretes pour un attribut `position` de BufferGeometry.
 * Meme parametrage que `physics/kepler` : plan XZ, Z negatif pour le sens prograde.
 */

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
