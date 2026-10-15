import { describe, expect, it } from 'vitest'
import { labelColumns } from '@/scene/labels/labelColumns'

describe('labelColumns', () => {
  const slots = labelColumns(13, 2000, 1000)

  it('splits the bodies as evenly as possible between left and right', () => {
    const left = slots.filter((slot) => slot.side === 'left')
    const right = slots.filter((slot) => slot.side === 'right')
    expect(Math.abs(left.length - right.length)).toBeLessThanOrEqual(1)
    expect(left.length + right.length).toBe(13)
  })

  it('keeps each column ordered top to bottom by input order (distance to the Sun)', () => {
    for (const side of ['left', 'right'] as const) {
      const ys = slots.filter((slot) => slot.side === side).map((slot) => slot.y)
      const sorted = [...ys].sort((a, b) => a - b)
      expect(ys).toEqual(sorted)
    }
  })

  it('anchors the columns on each side of the screen, proportionally to the window', () => {
    for (const slot of slots) {
      if (slot.side === 'left') expect(slot.x).toBeLessThan(1000)
      else expect(slot.x).toBeGreaterThan(1000)
      expect(slot.y).toBeGreaterThan(0)
      expect(slot.y).toBeLessThan(1000)
    }
    // * Proportionnel : memes fractions quelle que soit la taille
    const small = labelColumns(13, 1000, 500)
    expect(small[0].x / 1000).toBeCloseTo(slots[0].x / 2000)
    expect(small[0].y / 500).toBeCloseTo(slots[0].y / 1000)
  })

  it('spreads each column evenly inside the vertical band', () => {
    const left = slots.filter((slot) => slot.side === 'left')
    const gaps = left.slice(1).map((slot, i) => slot.y - left[i].y)
    for (const gap of gaps) expect(gap).toBeCloseTo(gaps[0], 5)
  })
})
