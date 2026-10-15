import { describe, expect, it } from 'vitest'
import { labelColumns } from '@/scene/labels/labelColumns'

describe('labelColumns', () => {
  const slots = labelColumns(13, 2000, 1000)

  it('puts the closest half on the left and the farthest half on the right', () => {
    const left = slots.filter((slot) => slot.side === 'left')
    const right = slots.filter((slot) => slot.side === 'right')
    expect(left.length).toBe(7)
    expect(right.length).toBe(6)
    // * Les 7 premiers (plus proches) a gauche, les suivants a droite
    expect(slots.slice(0, 7).every((slot) => slot.side === 'left')).toBe(true)
    expect(slots.slice(7).every((slot) => slot.side === 'right')).toBe(true)
  })

  it('reads top-to-bottom on both columns (farthest ends bottom right)', () => {
    const leftYs = slots.slice(0, 7).map((slot) => slot.y)
    expect(leftYs).toEqual([...leftYs].sort((a, b) => a - b))
    const rightYs = slots.slice(7).map((slot) => slot.y)
    expect(rightYs).toEqual([...rightYs].sort((a, b) => a - b))
  })

  it('anchors the columns on each side, proportionally to the window', () => {
    for (const slot of slots) {
      if (slot.side === 'left') expect(slot.x).toBeLessThan(1000)
      else expect(slot.x).toBeGreaterThan(1000)
    }
    const small = labelColumns(13, 1000, 500)
    expect(small[0].x / 1000).toBeCloseTo(slots[0].x / 2000)
    expect(small[0].y / 500).toBeCloseTo(slots[0].y / 1000)
  })

  it('stays clear of the HUD corner decorations top and bottom', () => {
    for (const slot of slots) {
      expect(slot.y).toBeGreaterThanOrEqual(1000 * 0.15)
      expect(slot.y).toBeLessThanOrEqual(1000 * 0.78)
    }
  })

  it('spreads each column evenly', () => {
    const leftYs = slots.slice(0, 7).map((slot) => slot.y)
    const gaps = leftYs.slice(1).map((y, i) => y - leftYs[i])
    for (const gap of gaps) expect(gap).toBeCloseTo(gaps[0], 5)
  })
})
