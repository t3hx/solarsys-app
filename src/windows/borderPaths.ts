/**
 * @module windows/borderPaths
 * @description Huit segments SVG dessinant le contour arrondi d'une fenetre (bord, coin, bord,
 * coin, ...), animes ensuite par dash-offset. Trait de 1 px centre sur le demi-pixel.
 */

const STROKE_WIDTH = 1

export function borderPaths(width: number, height: number, radius: number): string[] {
  if (width <= 0 || height <= 0) return []
  const r = Number.isNaN(radius) ? 0 : Math.max(0, Math.min(radius, width / 2, height / 2))
  const h = STROKE_WIDTH / 2
  const arc = `A ${r - h},${r - h} 0 0 1`
  return [
    `M ${r},${h} H ${width - r}`,
    `M ${width - r},${h} ${arc} ${width - h},${r}`,
    `M ${width - h},${r} V ${height - r}`,
    `M ${width - h},${height - r} ${arc} ${width - r},${height - h}`,
    `M ${width - r},${height - h} H ${r}`,
    `M ${r},${height - h} ${arc} ${h},${height - r}`,
    `M ${h},${height - r} V ${r}`,
    `M ${h},${r} ${arc} ${r},${h}`,
  ]
}
