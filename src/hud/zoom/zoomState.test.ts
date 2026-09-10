import { describe, expect, it } from 'vitest'
import { controlsConfig, starfieldConfig } from '@/config/scene'
import { zoomLevelFromDistance, zoomModeFromDistance } from '@/hud/zoom/zoomState'

const range = { minDistance: 100, farDistance: 10_000 }

describe('zoomLevelFromDistance', () => {
  it('is 10 at the minimum reachable distance and 0 at the far distance', () => {
    expect(zoomLevelFromDistance(100, range)).toBe(10)
    expect(zoomLevelFromDistance(10_000, range)).toBe(0)
  })

  it('is logarithmic: the geometric middle of the range is level 5', () => {
    expect(zoomLevelFromDistance(1000, range)).toBe(5)
    expect(zoomLevelFromDistance(Math.sqrt(100 * 1000), range)).toBe(8)
  })

  it('clamps below the minimum and beyond the far distance', () => {
    expect(zoomLevelFromDistance(1, range)).toBe(10)
    expect(zoomLevelFromDistance(1e6, range)).toBe(0)
  })

  it('uses the inner radius of the star sphere as the default far distance', () => {
    expect(zoomLevelFromDistance(starfieldConfig.minDistance, { minDistance: 80 })).toBe(0)
  })
})

describe('zoomModeFromDistance', () => {
  const options = { minDistance: 100, starfieldMin: 30_000, starfieldMax: 45_000 }

  it('is "max" at the minimum reachable distance, with a 1 % tolerance', () => {
    expect(zoomModeFromDistance(100, options)).toBe('max')
    expect(zoomModeFromDistance(100.9, options)).toBe('max')
    expect(zoomModeFromDistance(102, options)).toBe('normal')
  })

  it('is "normal" up to the star sphere', () => {
    expect(zoomModeFromDistance(1000, options)).toBe('normal')
    expect(zoomModeFromDistance(29_999, options)).toBe('normal')
  })

  it('is "outOfRange" inside the star sphere shell', () => {
    expect(zoomModeFromDistance(30_000, options)).toBe('outOfRange')
    expect(zoomModeFromDistance(44_999, options)).toBe('outOfRange')
  })

  it('is "void" once the camera has left the star sphere', () => {
    expect(zoomModeFromDistance(45_000, options)).toBe('void')
    expect(zoomModeFromDistance(60_000, options)).toBe('void')
  })

  it('defaults to the star sphere radii of the scene configuration', () => {
    expect(zoomModeFromDistance(starfieldConfig.maxDistance, { minDistance: 80 })).toBe('void')
  })
})

describe('camera range', () => {
  it('lets the camera leave the star sphere to see it from the void', () => {
    expect(controlsConfig.maxDistance).toBeGreaterThan(starfieldConfig.maxDistance)
  })
})
