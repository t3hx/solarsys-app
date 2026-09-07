import { describe, expect, it } from 'vitest'
import type { KeplerianOrbit } from '@/physics/kepler'
import {
  eccentricToTrueAnomaly,
  meanAnomalyAt,
  orbitalPosition,
  solveKepler,
} from '@/physics/kepler'

const circular: KeplerianOrbit = {
  semiMajorAxis: 100,
  eccentricity: 0,
  argOfPerihelion: 0,
  meanAnomalyAtEpoch: 0,
  periodDays: 360,
}

// ~ Pluton : l'orbite la plus excentrique du jeu de donnees
const pluto: KeplerianOrbit = {
  semiMajorAxis: 250,
  eccentricity: 0.2488,
  argOfPerihelion: 1.98675,
  meanAnomalyAtEpoch: 0.25359,
  periodDays: 90_560,
}

describe('solveKepler', () => {
  it('returns the mean anomaly for a circular orbit', () => {
    expect(solveKepler(1.234, 0)).toBeCloseTo(1.234, 10)
  })

  it('satisfies M = E - e sin E for an eccentric orbit', () => {
    const e = pluto.eccentricity
    for (const M of [0, 0.5, 1.5, 3, 4.5, 6]) {
      const E = solveKepler(M, e)
      expect(E - e * Math.sin(E)).toBeCloseTo(M, 8)
    }
  })

  it('converges for a highly eccentric orbit', () => {
    const E = solveKepler(2.5, 0.9)
    expect(E - 0.9 * Math.sin(E)).toBeCloseTo(2.5, 8)
  })
})

describe('eccentricToTrueAnomaly', () => {
  it('is the identity for a circular orbit', () => {
    expect(eccentricToTrueAnomaly(0.7, 0)).toBeCloseTo(0.7)
  })

  it('is zero at perihelion and pi at aphelion', () => {
    expect(eccentricToTrueAnomaly(0, 0.3)).toBeCloseTo(0)
    expect(Math.abs(eccentricToTrueAnomaly(Math.PI, 0.3))).toBeCloseTo(Math.PI)
  })
})

describe('meanAnomalyAt', () => {
  it('advances by 2 pi over one period', () => {
    expect(meanAnomalyAt(circular, 0)).toBe(0)
    expect(meanAnomalyAt(circular, 360)).toBeCloseTo(2 * Math.PI)
    expect(meanAnomalyAt(circular, 90)).toBeCloseTo(Math.PI / 2)
  })

  it('starts from the mean anomaly at epoch', () => {
    expect(meanAnomalyAt(pluto, 0)).toBe(pluto.meanAnomalyAtEpoch)
  })
})

describe('orbitalPosition', () => {
  it('traces a circle of radius a for a circular orbit', () => {
    for (const t of [0, 45, 90, 200, 359]) {
      const { x, z } = orbitalPosition(circular, t)
      expect(Math.hypot(x, z)).toBeCloseTo(100, 8)
    }
  })

  it('moves counter-clockwise seen from +Y (z negative after a quarter period)', () => {
    expect(orbitalPosition(circular, 0)).toEqual({ x: 100, z: -0 })
    const quarter = orbitalPosition(circular, 90)
    expect(quarter.x).toBeCloseTo(0, 8)
    expect(quarter.z).toBeCloseTo(-100, 8)
  })

  it('keeps the radial distance between perihelion and aphelion', () => {
    const a = pluto.semiMajorAxis
    const e = pluto.eccentricity
    for (let t = 0; t < pluto.periodDays; t += pluto.periodDays / 37) {
      const r = Math.hypot(orbitalPosition(pluto, t).x, orbitalPosition(pluto, t).z)
      expect(r).toBeGreaterThanOrEqual(a * (1 - e) - 1e-6)
      expect(r).toBeLessThanOrEqual(a * (1 + e) + 1e-6)
    }
  })

  it('places perihelion at distance a(1 - e) along the argument of perihelion', () => {
    const orbit: KeplerianOrbit = { ...pluto, meanAnomalyAtEpoch: 0 }
    const { x, z } = orbitalPosition(orbit, 0)
    const r = orbit.semiMajorAxis * (1 - orbit.eccentricity)
    expect(x).toBeCloseTo(r * Math.cos(orbit.argOfPerihelion), 6)
    expect(z).toBeCloseTo(-r * Math.sin(orbit.argOfPerihelion), 6)
  })

  it('writes into the provided output object without allocating', () => {
    const out = { x: 0, z: 0 }
    const result = orbitalPosition(circular, 90, out)
    expect(result).toBe(out)
    expect(out.z).toBeCloseTo(-100, 8)
  })
})
