/**
 * @module config/colors
 * @description Couleurs nommees de la scene 3D et du HUD (hexadecimal, compatibles Three et CSS).
 */
export const colors = {
  white: '#FFFFFF',
  black: '#000000',
  red: '#FF0000',
  purple: '#800080',
  /** Couleur HUD principale */
  springGreen: '#00FF7F',
  shadowedSpringGreen: '#00944a91',
  /** Badges de comparaison avec la Terre */
  coral: '#FF6B6B',
  turquoise: '#4ECDC4',
} as const

/**
 * Couleur tactique de chaque corps heliocentrique : lignes d'orbite et etiquettes de la
 * vue tactique. Logique « couleur evidente » (Mars rouge, Terre verte, Neptune bleue,
 * Uranus cyan, Venus jaune...), toutes lisibles sur fond noir.
 */
export const tacticalColors: Record<string, string> = {
  mercury: '#BFB9AC',
  venus: '#FFD54A',
  earth: '#30D158',
  mars: '#FF5A4D',
  jupiter: '#FFA94D',
  saturn: '#F2CE7B',
  uranus: '#55E0E8',
  neptune: '#5C8CFF',
  pluto: '#D7A97C',
  ceres: '#AEBDC6',
  haumea: '#E8ECF5',
  makemake: '#E8906B',
  eris: '#CBB8F0',
}
