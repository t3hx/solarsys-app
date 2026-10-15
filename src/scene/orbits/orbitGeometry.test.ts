import { describe, expect, it } from 'vitest'
import { orbitalPosition } from '@/physics/kepler'
import { orbitLineDefaults } from '@/config/rendering'
import { ellipsePoints, orbitLineResolution } from '@/scene/orbits/orbitGeometry'

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

function distanceToPolyline(x: number, z: number, points: Float32Array): number {
  let best = Infinity
  const segments = points.length / 3 - 1
  for (let i = 0; i < segments; i++) {
    const ax = points[i * 3]!
    const az = points[i * 3 + 2]!
    const dx = points[i * 3 + 3]! - ax
    const dz = points[i * 3 + 5]! - az
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)))
    best = Math.min(best, Math.hypot(x - (ax + t * dx), z - (az + t * dz)))
  }
  return best
}

describe('orbitLineResolution', () => {
  it('keeps every body within a twentieth of its radius of its orbit line', () => {
    // * Cas reels : Eris (a ≈ 17 070, e = 0,436, rayon 0,25) et Pluton (a ≈ 10 020, e = 0,249, rayon 0,255)
    const cases = [
      { a: 17070, e: 0.436, omega: 2.63, radius: 0.25 },
      { a: 10020, e: 0.249, omega: 1.98, radius: 0.255 },
      { a: 841, e: 0.076, omega: 1.28, radius: 0.101 },
    ]
    for (const { a, e, omega, radius } of cases) {
      const resolution = orbitLineResolution(a, radius)
      const points = ellipsePoints(a, e, omega, resolution)
      const orbit = {
        semiMajorAxis: a,
        eccentricity: e,
        argOfPerihelion: omega,
        meanAnomalyAtEpoch: 0,
        periodDays: 1,
      }
      for (let t = 0; t < 1; t += 1 / 40) {
        const { x, z } = orbitalPosition(orbit, t)
        expect(distanceToPolyline(x, z, points)).toBeLessThan(radius / 20)
      }
    }
  })

  it('uses more segments for distant orbits than for near ones, within bounds', () => {
    expect(orbitLineResolution(17070, 0.25)).toBeGreaterThan(orbitLineResolution(399, 1.37))
    expect(orbitLineResolution(1, 100)).toBe(orbitLineDefaults.minResolution)
    expect(orbitLineResolution(1e9, 0.001)).toBe(orbitLineDefaults.maxResolution)
  })
})
