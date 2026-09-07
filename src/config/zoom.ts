/**
 * @module config/zoom
 * @description Seuils de distance camera-cible (unites de scene) delimitant les niveaux
 * de zoom 10 (le plus proche) a 0 (le plus loin), et marge de la zone "void".
 */
export const zoomThresholds: readonly number[] = [
  350, // niveau 10 → 9
  450, // 9 → 8
  600, // 8 → 7
  800, // 7 → 6
  1200, // 6 → 5 (zone Mars-Ceres)
  2500, // 5 → 4 (zone Saturne)
  5000, // 4 → 3 (zone Uranus)
  8000, // 3 → 2 (zone Neptune)
  13000, // 2 → 1 (zone Pluton / KBO)
  25000, // 1 → 0 (aphelie d'Eris)
]

/** Au-dela de (distance max des controles - marge), l'indicateur affiche VOID. */
export const zoomVoidMargin = 1000
