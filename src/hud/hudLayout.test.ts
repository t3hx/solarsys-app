import { describe, expect, it } from 'vitest'
import { cornerSizes, hudLayout, hudScale, uiScale } from '@/hud/hudLayout'

describe('uiScale', () => {
  it('is 1 on a 1080p non-Retina screen and follows the height', () => {
    expect(uiScale(1080, 1)).toBe(1)
    expect(uiScale(720, 1)).toBeCloseTo(720 / 1080, 6)
  })

  it('boosts Retina screens by 15 % and clamps between 0.5 and 3', () => {
    expect(uiScale(1080, 2)).toBeCloseTo(1.15, 6)
    expect(uiScale(100, 1)).toBe(0.5)
    expect(uiScale(10_000, 2)).toBe(3)
  })
})

describe('hudScale', () => {
  it('applies the height ratio on top of the UI scale, as the Vue overlay did', () => {
    expect(hudScale(1080, 1)).toBe(1)
    expect(hudScale(720, 1)).toBeCloseTo((720 / 1080) ** 2, 6)
  })
})

describe('hudLayout', () => {
  const layout = hudLayout(1920, 1080, 1)

  it('places the corners at the margins with their original sizes at scale 1', () => {
    expect(layout.margin).toBe(10)
    expect(layout.nw).toEqual({ x: 10, y: 10, width: 80, height: 290 })
    expect(layout.ne).toEqual({ x: 1870, y: 10, width: 40, height: 40 })
    expect(layout.sw).toEqual({ x: 10, y: 1030, width: 280, height: 40 })
    // * Coin SE agrandi (100 unites) avec une zone de libelle de 24 unites au-dessus du triangle
    expect(layout.se).toEqual({ x: 1780, y: 946, width: 130, height: 124 })
  })

  it('places the zoom indicator one and a half widths left of the NE corner', () => {
    expect(layout.zoom.width).toBe(cornerSizes.zoom.width)
    expect(layout.zoom.x).toBe(1870 - 292 - 146)
    expect(layout.zoom.y).toBe(10)
  })

  it('connects the corners with five frame lines', () => {
    expect(layout.lines).toHaveLength(5)
    const [topLeft, topRight, right, bottom, left] = layout.lines
    expect(topLeft).toEqual([90, 10, layout.zoom.x, 10])
    expect(topRight).toEqual([layout.zoom.x + 292, 10, 1870, 10])
    // * La ligne droite s'arrete au-dessus du triangle, pas du libelle
    expect(right).toEqual([1910, 50, 1910, 970])
    expect(bottom).toEqual([290, 1070, 1780, 1070])
    expect(left).toEqual([10, 300, 10, 1030])
  })

  it('scales sizes and margin together', () => {
    const small = hudLayout(1280, 720, 0.5)
    expect(small.margin).toBe(5)
    expect(small.nw).toEqual({ x: 5, y: 5, width: 40, height: 145 })
    expect(small.se.x).toBe(1280 - 5 - 65)
  })

  it('places the drawer against the menu corner', () => {
    expect(layout.drawer).toEqual({ x: 90, y: 32, width: 500, height: 918 })
  })
})
