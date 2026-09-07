/**
 * @module config/rendering
 * @description Materiaux par type de corps, couches superposees, anneaux et lumiere du Soleil.
 * Sans parametres d'ombre (decision du 2026-09-07).
 */

export const materialDefaults = {
  planet: { roughness: 0.8, metalness: 0.2 },
  satellite: { roughness: 0.9, metalness: 0.1 },
  /** Corps avec shader jour/nuit : surface diffuse, emissivite subtile */
  dayNight: { roughness: 1.0, metalness: 0.0, emissiveIntensity: 0.5 },
  atmosphere: { roughness: 0.9, metalness: 0.1 },
} as const

export const layerScaleFactors = {
  clouds: 1.002,
  atmosphere: 1.01,
} as const

export const cloudLayerDefaults = {
  opacity: 0.6,
} as const

export const atmosphereLayerDefaults = {
  opacity: 0.5,
} as const

export const ringLayerDefaults = {
  thetaSegments: 128,
  /** Anneaux textures (Saturne) */
  textured: { opacity: 0.9, roughness: 0.8, metalness: 0.1 },
  /** Anneaux sans texture (Uranus) : couleur unie attenuee */
  fallback: { opacity: 0.3, roughness: 0.9, metalness: 0.0 },
  fallbackColor: '#99AACC',
} as const

export const sunLightConfig = {
  /**
   * Intensite recalibree pour decay = 1.5 : illuminance ≈ 0.6 a la distance de la
   * Terre (~325 u). Formule : 0.6 × 325^1.5 ≈ 3500.
   */
  intensity: 3500,
  decay: 1.5,
} as const

export const specularProcessing = {
  /** Rugosite minimale pour limiter la brillance de l'eau (0-255) */
  minRoughness: 128,
} as const

export const sphereSegments = 64

export const outlineConfig = {
  hoverColor: '#FFFFFF',
  selectedColor: '#00FF7F',
  edgeStrength: 5,
  bloomIntensity: 0.4,
  /** Rayon du bloom (0.85 par defaut dans postprocessing) : plus serre, proche du reglage Vue */
  bloomRadius: 0.4,
  /** Anti-aliasing du composer (MSAA) : lisse les lignes d'orbite */
  multisampling: 4,
} as const

export const orbitLineDefaults = {
  opacity: 0.2,
  /** Opacite de la ligne du corps survole ou selectionne */
  highlightOpacity: 0.8,
  /** Nombre de segments de l'ellipse */
  resolution: 512,
} as const
