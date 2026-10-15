/**
 * @module scene/labels/labelColumns
 * @description Repartition des etiquettes tactiques en deux colonnes fixes, a gauche et a
 * droite de l'ecran : l'ordre d'entree (distance croissante au Soleil) alterne gauche /
 * droite, chaque colonne se lit donc de haut en bas du plus proche au plus lointain.
 * Positions en pixels, proportionnelles a la taille de la fenetre. Pur.
 */

/** Abscisse des colonnes, en fraction de la largeur (bord interieur de la boite) */
const COLUMN_X = 0.15
/** Bande verticale occupee par les colonnes, en fraction de la hauteur */
const BAND_TOP = 0.16
const BAND_BOTTOM = 0.84

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
    const side = index % 2 === 0 ? 'left' : 'right'
    const row = Math.floor(index / 2)
    return {
      side,
      x: side === 'left' ? width * COLUMN_X : width * (1 - COLUMN_X),
      y: slotY(row, side === 'left' ? leftCount : rightCount),
    } as const
  })
}
