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
 * vue tactique. Les corps a couleur evidente la gardent (Mars rouge, Terre verte, Neptune
 * bleue, Uranus cyan, Venus jaune, Jupiter orange) ; les autres recoivent le reste du
 * spectre, reparti pour que chaque ligne reste distinguable sur fond noir (test de
 * distance par paire dans tacticalColors.test).
 */
export const tacticalColors: Record<string, string> = {
  mars: '#FF4433',
  jupiter: '#FFA02E',
  venus: '#FFE84D',
  saturn: '#AEF23C',
  earth: '#27E35F',
  makemake: '#16F7D0',
  uranus: '#38BDFF',
  neptune: '#3D5BFF',
  pluto: '#8E64FF',
  eris: '#D24DFF',
  mercury: '#FF49C1',
  haumea: '#FF7080',
  ceres: '#F5F5F5',
}
