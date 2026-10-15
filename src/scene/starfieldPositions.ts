/**
 * @module scene/starfieldPositions
 * @description Distribution uniforme de points dans une coquille spherique
 * (racine cubique du rayon pour l'uniformite volumique).
 */
export function generateStarPositions(
  count: number,
  minDistance: number,
  maxDistance: number,
  random: () => number = Math.random,
): Float32Array {
  const positions = new Float32Array(count * 3)
  const minCubed = minDistance ** 3
  const maxCubed = maxDistance ** 3
  for (let i = 0; i < count; i++) {
    const theta = random() * Math.PI * 2
    const phi = Math.acos(2 * random() - 1)
    const r = Math.cbrt(minCubed + random() * (maxCubed - minCubed))
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = r * Math.cos(phi)
  }
  return positions
}
