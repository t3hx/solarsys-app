/**
 * @module scene/labels/labelColumns
 * @description Repartition des etiquettes tactiques en deux colonnes fixes : la moitie la
 * plus proche du Soleil a gauche, lue de haut en bas ; la moitie la plus lointaine a
 * droite, remontant de bas en haut (le plus lointain finit en haut a droite). La bande
 * verticale evite les decorations des coins du HUD. Positions en pixels, proportionnelles
 * a la taille de la fenetre. Pur.
 */

/** Abscisse des colonnes, en fraction de la largeur (bord interieur de la boite) */
const COLUMN_X = 0.15
/** Bande verticale occupee par les colonnes, en fraction de la hauteur */
const BAND_TOP = 0.15
const BAND_BOTTOM = 0.78

export interface ColumnSlot {
  side: 'left' | 'right'
  /** Point d'ancrage de la boite et de la tige (bord de la boite cote planete) */
  x: number
  y: number
}

export function labelColumns(count: number, width: number, height: number): ColumnSlot[] {
  const leftCount = Math.ceil(count / 2)
  const rightCount = count - leftCount
  const slotY = (row: number, rows: number): number => {
    const top = height * BAND_TOP
    const bottom = height * BAND_BOTTOM
    if (rows <= 1) return (top + bottom) / 2
    return top + (row * (bottom - top)) / (rows - 1)
  }
  return Array.from({ length: count }, (_, index) => {
    if (index < leftCount) {
      // ~ Moitie proche : colonne gauche, de haut en bas
      return { side: 'left', x: width * COLUMN_X, y: slotY(index, leftCount) } as const
    }
    // ~ Moitie lointaine : colonne droite, de bas en haut
    const row = rightCount - 1 - (index - leftCount)
    return { side: 'right', x: width * (1 - COLUMN_X), y: slotY(row, rightCount) } as const
  })
}
