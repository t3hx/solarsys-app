/**
 * @module config/scene
 * @description Parametres de la scene : camera, renderer, controles, eclairage ambiant,
 * champ d'etoiles, focus et vue tactique. Valeurs reprises de la version Vue.
 * Pas d'ombres (decision du 2026-09-07).
 */
import { colors } from '@/config/colors'

export const cameraConfig = {
  fov: 75,
  near: 0.1,
  far: 500_000,
  initialPosition: [0, 75, 1000] as const,
} as const

export const rendererConfig = {
  antialias: true,
  backgroundColor: colors.black,
  /** Exposition ACES Filmic : > 1 rehausse les zones sombres */
  toneMappingExposure: 1.2,
  /** Plafond du device pixel ratio (audit P3) */
  maxPixelRatio: 2,
} as const

export const controlsConfig = {
  dampingFactor: 0.05,
  minDistance: 0.1,
  /** Couvre l'aphelie d'Eris (~24 500 u) avec marge */
  maxDistance: 35_000,
  maxPolarAngle: Math.PI / 2,
} as const

export const ambientLightConfig = {
  color: colors.white,
  intensity: 0.35,
} as const

export const starfieldConfig = {
  count: 5000,
  size: 5,
  /** Au-dela de l'aphelie d'Eris pour ne pas chevaucher les orbites */
  minDistance: 30_000,
  maxDistance: 45_000,
  color: colors.white,
} as const

export const cameraFocusConfig = {
  focalLengthMultiplier: 1.5,
  minFocusDistance: 0.15,
  /** Decalage vertical relatif pour un meilleur angle de vue */
  verticalOffsetRatio: 0.15,
  focusDuration: 1.5,
  resetDuration: 1.5,
} as const

export const tacticalViewConfig = {
  /** FOV 75° → rayon visible ≈ hauteur × 0.767 : 28 000 u couvre Neptune et Pluton */
  height: 28_000,
  transitionDuration: 2.0,
} as const
