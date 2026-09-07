import { describe, expect, it } from 'vitest'
import { orbitalPosition } from '@/physics/kepler'
import { ellipsePoints } from '@/scene/orbits/orbitGeometry'

function radiusAt(points: Float32Array, index: number): number {
  return Math.hypot(points[index * 3]!, points[index * 3 + 2]!)
}

describe('ellipsePoints', () => {
  it('returns resolution + 1 points of 3 components, on the XZ plane', () => {
    const points = ellipsePoints(100, 0, 0, 64)
    expect(points).toBeInstanceOf(Float32Array)
    expect(points.length).toBe(65 * 3)
    for (let i = 0; i < 65; i++) expect(points[i * 3 + 1]).toBe(0)
  })

  it('closes the loop: the last point equals the first', () => {
    const points = ellipsePoints(100, 0.3, 1.2, 128)
    expect(points[0]).toBeCloseTo(points[128 * 3]!, 4)
    expect(points[2]).toBeCloseTo(points[128 * 3 + 2]!, 4)
  })

  it('is a circle of radius a when e = 0', () => {
    const points = ellipsePoints(100, 0, 0.5, 32)
    for (let i = 0; i <= 32; i++) expect(radiusAt(points, i)).toBeCloseTo(100, 4)
  })

  it('keeps every point between perihelion and aphelion distances', () => {
    const a = 250
    const e = 0.2488
    const points = ellipsePoints(a, e, 1.98, 256)
    for (let i = 0; i <= 256; i++) {
      const r = radiusAt(points, i)
      expect(r).toBeGreaterThanOrEqual(a * (1 - e) - 1e-3)
      expect(r).toBeLessThanOrEqual(a * (1 + e) + 1e-3)
    }
  })

  it('passes through the perihelion computed by the Kepler solver', () => {
    const a = 250
    const e = 0.2488
    const omega = 1.98
    const points = ellipsePoints(a, e, omega, 512)
    const perihelion = orbitalPosition(
      {
        semiMajorAxis: a,
        eccentricity: e,
        argOfPerihelion: omega,
        meanAnomalyAtEpoch: 0,
        periodDays: 1,
      },
      0,
    )
    expect(points[0]).toBeCloseTo(perihelion.x, 3)
    expect(points[2]).toBeCloseTo(perihelion.z, 3)
  })
})
