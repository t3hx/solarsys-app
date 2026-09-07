/**
 * @module hud/hudLayout
 * @description Geometrie du HUD en pixels, pure. Remplace le SVG 1920×1080 etire de la version
 * Vue (audit A12) tout en reproduisant ses tailles a l'ecran :
 * - `uiScale` : facteur des controles HTML (hauteur / 1080, +15 % sur Retina, borne 0.5–3) ;
 * - `hudScale` : facteur des coins SVG, qui cumulait ce facteur et le ratio de hauteur ;
 * - `hudLayout` : boites des quatre coins, de l'indicateur de zoom, du tiroir, et les cinq
 *   lignes du cadre qui les relient.
 */

export interface Box {
  x: number
  y: number
  width: number
  height: number
}

/** [x1, y1, x2, y2] */
export type Line = [number, number, number, number]

export interface HudLayout {
  margin: number
  nw: Box
  ne: Box
  sw: Box
  se: Box
  zoom: Box
  drawer: Box
  lines: Line[]
}

/** Tailles d'origine (viewBox de chaque coin), en unites de reference */
export const cornerSizes = {
  nw: { width: 80, height: 290 },
  ne: { width: 40, height: 40 },
  sw: { width: 280, height: 40 },
  se: { width: 50, height: 50 },
  zoom: { width: 292, height: 42 },
} as const

const REFERENCE_HEIGHT = 1080
const REFERENCE_WIDTH = 1920
const FRAME_MARGIN = 10
const MENU_BUTTON_TOP = 22
const DRAWER_WIDTH = 500
const DRAWER_HEIGHT_RATIO = 0.85
const MIN_SCALE = 0.5
const MAX_SCALE = 3
const RETINA_BOOST = 1.15

export function uiScale(height: number, devicePixelRatio: number): number {
  const base = (height / REFERENCE_HEIGHT) * (devicePixelRatio > 1 ? RETINA_BOOST : 1)
  return Math.max(MIN_SCALE, Math.min(MAX_SCALE, base))
}

export function hudScale(height: number, devicePixelRatio: number): number {
  return uiScale(height, devicePixelRatio) * (height / REFERENCE_HEIGHT)
}

export function hudLayout(width: number, height: number, scale: number): HudLayout {
  const margin = FRAME_MARGIN * scale
  const size = (key: keyof typeof cornerSizes): [number, number] => [
    cornerSizes[key].width * scale,
    cornerSizes[key].height * scale,
  ]

  const [nwWidth, nwHeight] = size('nw')
  const [neWidth, neHeight] = size('ne')
  const [swWidth, swHeight] = size('sw')
  const [seWidth, seHeight] = size('se')
  const [zoomWidth, zoomHeight] = size('zoom')

  const nw: Box = { x: margin, y: margin, width: nwWidth, height: nwHeight }
  const ne: Box = { x: width - margin - neWidth, y: margin, width: neWidth, height: neHeight }
  const sw: Box = { x: margin, y: height - margin - swHeight, width: swWidth, height: swHeight }
  const se: Box = {
    x: width - margin - seWidth,
    y: height - margin - seHeight,
    width: seWidth,
    height: seHeight,
  }
  const zoom: Box = {
    x: ne.x - zoomWidth - zoomWidth / 2,
    y: margin,
    width: zoomWidth,
    height: zoomHeight,
  }
  const drawer: Box = {
    x: nw.x + nw.width,
    y: nw.y + MENU_BUTTON_TOP * scale,
    width: DRAWER_WIDTH * (width / REFERENCE_WIDTH),
    height: height * DRAWER_HEIGHT_RATIO,
  }

  const lines: Line[] = [
    [nw.x + nw.width, margin, zoom.x, margin],
    [zoom.x + zoom.width, margin, ne.x, margin],
    [ne.x + ne.width, ne.y + ne.height, se.x + se.width, se.y],
    [sw.x + sw.width, sw.y + sw.height, se.x, se.y + se.height],
    [nw.x, nw.y + nw.height, sw.x, sw.y],
  ]

  return { margin, nw, ne, sw, se, zoom, drawer, lines }
}
