/**
 * @module scene/labels/labelScreenPositions
 * @description Pont non reactif entre la scene et le HUD pour la vue tactique : le
 * traqueur (cote Canvas) y ecrit chaque frame la position ecran des corps, l'overlay DOM
 * (cote HUD) la lit dans sa propre boucle rAF. Jamais dans du state React.
 */

export interface ScreenPoint {
  x: number
  y: number
}

export const labelScreenPositions = new Map<string, ScreenPoint>()
