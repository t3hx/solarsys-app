/**
 * @module config/scaling
 * @description Facteurs d'echelle entre les distances reelles (km, UA) et les unites
 * de la scene 3D. Repris tels quels de la version Vue.
 */
export const scaleFactors = {
  /** Planetes et satellites : 4 660 km = 1 unite → Terre ≈ 1.37 u, Jupiter = 15 u */
  celestialBodyKmPerUnit: 69_911 / 15,
  /** Soleil, echelle separee (109x la Terre sinon) : 696 340 km = 75 u */
  starKmPerUnit: 696_340 / 75,
  /** Distances orbitales planetaires : 1 UA = 250 u */
  orbitalDistanceAuPerUnit: 0.004,
  /** Distances orbitales locales (satellites) : 100 000 km = 1 u → Lune ≈ 3.84 u */
  localOrbitalDistanceKmPerUnit: 100_000,
} as const
