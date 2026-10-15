/**
 * @module scene/labels/labelPlacement
 * @description Placement de l'etiquette tactique d'un corps : la tige part du corps dans
 * la direction opposee au centre de l'ecran (le Soleil, en vue tactique de dessus) et la
 * boite s'accroche au bout, etendue vers l'exterieur. Pur : calcule depuis les
 * coordonnees NDC du corps (projection camera, y vers le haut).
 */

/** Longueur de la tige en pixels ecran */
export const LEADER_LENGTH = 56

export interface LabelPlacement {
  /** Angle ecran de la tige en radians (0 = vers la droite, y ecran vers le bas) */
  angle: number
  /** Bout de la tige en pixels, relatif au corps */
  dx: number
  dy: number
  /** Translation CSS de la boite pour qu'elle s'etende a l'oppose du corps */
  shiftX: '0' | '-100%'
  shiftY: '0' | '-100%'
}

/**
 * Longueur de tige etagee : plus le corps est proche du Soleil (ordre croissant de
 * demi-grand axe), plus la tige est longue, pour que les boites du groupe interieur ne se
 * chevauchent pas pres du centre.
 */
export function leaderLength(distanceOrder: number): number {
  const INNER_STAGGER = 24
  return LEADER_LENGTH + INNER_STAGGER * Math.max(0, 7 - distanceOrder)
}

/**
 * Decalage angulaire alterne (radians) : une etiquette sur deux devie legerement de la
 * radiale pour que deux corps voisins alignes sur le meme cap ne superposent pas leurs
 * boites.
 */
export function leaderAngleOffset(distanceOrder: number): number {
  return distanceOrder % 2 === 0 ? 0 : 0.4
}

export function labelPlacement(
  ndcX: number,
  ndcY: number,
  length: number = LEADER_LENGTH,
  angleOffset: number = 0,
): LabelPlacement {
  // ~ En espace ecran l'axe y descend : on inverse le y des NDC
  let x = ndcX
  let y = -ndcY
  const norm = Math.hypot(x, y)
  if (norm < 1e-6) {
    // ~ Corps au centre exact : diagonale haut-droite par defaut
    x = Math.SQRT1_2
    y = -Math.SQRT1_2
  } else {
    x /= norm
    y /= norm
  }
  if (angleOffset !== 0) {
    const cos = Math.cos(angleOffset)
    const sin = Math.sin(angleOffset)
    const rx = x * cos - y * sin
    y = x * sin + y * cos
    x = rx
  }
  return {
    angle: Math.atan2(y, x),
    dx: x * length,
    dy: y * length,
    shiftX: x < 0 ? '-100%' : '0',
    shiftY: y < 0 ? '-100%' : '0',
  }
}
