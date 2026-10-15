/**
 * @module config/zoom
 * @description Jauge de zoom relative a la cible : niveau 10 a la distance minimale
 * atteignable (surface du corps suivi, ou du Soleil en vue libre), niveau 0 a l'entree
 * de la sphere d'etoiles, echelle logarithmique entre les deux.
 */
export const zoomConfig = {
  levels: 10,
  /** Tolerance relative pour afficher MAX a la butee */
  maxTolerance: 1.01,
} as const
