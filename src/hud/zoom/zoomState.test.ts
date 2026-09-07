import { describe, expect, it } from 'vitest'
import { zoomThresholds } from '@/config/zoom'
import { zoomLevelFromDistance, zoomModeFromDistance } from '@/hud/zoom/zoomState'

describe('zoomLevelFromDistance', () => {
  it('uses the configured thresholds by default', () => {
    expect(zoomThresholds).toHaveLength(10)
    expect(zoomLevelFromDistance(100)).toBe(10)
  })

  it('maps a distance below the first threshold to the maximum level', () => {
    expect(zoomLevelFromDistance(0, [350, 450, 600])).toBe(3)
    expect(zoomLevelFromDistance(349.9, [350, 450, 600])).toBe(3)
  })

  it('decreases by one level at each threshold', () => {
    const thresholds = [350, 450, 600]
    expect(zoomLevelFromDistance(350, thresholds)).toBe(2)
    expect(zoomLevelFromDistance(449, thresholds)).toBe(2)
    expect(zoomLevelFromDistance(450, thresholds)).toBe(1)
    expect(zoomLevelFromDistance(599, thresholds)).toBe(1)
  })

  it('returns zero beyond the last threshold', () => {
    expect(zoomLevelFromDistance(600, [350, 450, 600])).toBe(0)
    expect(zoomLevelFromDistance(1e6, [350, 450, 600])).toBe(0)
  })
})

describe('zoomModeFromDistance', () => {
  const options = { thresholds: [350, 450, 600], maxDistance: 5000, voidMargin: 1000 }

  it('is "max" at or below the first threshold', () => {
    expect(zoomModeFromDistance(350, options)).toBe('max')
    expect(zoomModeFromDistance(10, options)).toBe('max')
  })

  it('is "normal" between the first and last thresholds', () => {
    expect(zoomModeFromDistance(351, options)).toBe('normal')
    expect(zoomModeFromDistance(600, options)).toBe('normal')
  })

  it('is "outOfRange" beyond the last threshold but before the void', () => {
    expect(zoomModeFromDistance(601, options)).toBe('outOfRange')
    expect(zoomModeFromDistance(3999, options)).toBe('outOfRange')
  })

  it('is "void" within the margin of the maximum camera distance', () => {
    expect(zoomModeFromDistance(4000, options)).toBe('void')
    expect(zoomModeFromDistance(5000, options)).toBe('void')
  })
})
