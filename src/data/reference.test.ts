/**
 * Verification « code contre realite » : les donnees livrees sont comparees aux valeurs du
 * NASA Planetary Fact Sheet (NSSDCA, D. R. Williams) et des elements kepleriens J2000 du JPL.
 * Un ecart au-dela des tolerances signale une donnee a corriger, pas un test a assouplir.
 */
import { describe, expect, it } from 'vitest'
import { radToDeg } from '@/physics/units'
import { solarSystemFixture } from '@/test/fixtures/solarSystem'

interface Reference {
  /** Obliquite par rapport a l'orbite, en degres (> 90° : rotation retrograde) */
  obliquityDeg: number
  /** Periode de rotation siderale, en heures (valeur absolue) */
  rotationHours: number
  semiMajorAxisKm: number
  eccentricity: number
  inclinationDeg: number
  periodDays: number
  /** Longitude du perihelie ϖ = Ω + ω, en degres (J2000) */
  longitudeOfPerihelionDeg?: number
  /** Anomalie moyenne a J2000, en degres */
  meanAnomalyDeg?: number
}

const reference: Record<string, Reference> = {
  mercury: {
    obliquityDeg: 0.034,
    rotationHours: 1407.6,
    semiMajorAxisKm: 57.909e6,
    eccentricity: 0.2056,
    inclinationDeg: 7.004,
    periodDays: 87.969,
    longitudeOfPerihelionDeg: 77.456,
    meanAnomalyDeg: 174.796,
  },
  venus: {
    obliquityDeg: 177.36,
    rotationHours: 5832.5,
    semiMajorAxisKm: 108.21e6,
    eccentricity: 0.0068,
    inclinationDeg: 3.395,
    periodDays: 224.701,
    longitudeOfPerihelionDeg: 131.533,
    meanAnomalyDeg: 50.115,
  },
  earth: {
    obliquityDeg: 23.44,
    rotationHours: 23.9345,
    semiMajorAxisKm: 149.598e6,
    eccentricity: 0.0167,
    inclinationDeg: 0,
    periodDays: 365.256,
    longitudeOfPerihelionDeg: 102.947,
    meanAnomalyDeg: 357.517,
  },
  mars: {
    obliquityDeg: 25.19,
    rotationHours: 24.6229,
    semiMajorAxisKm: 227.956e6,
    eccentricity: 0.0935,
    inclinationDeg: 1.848,
    periodDays: 686.98,
    longitudeOfPerihelionDeg: 336.041,
    meanAnomalyDeg: 19.373,
  },
  jupiter: {
    obliquityDeg: 3.13,
    rotationHours: 9.925,
    semiMajorAxisKm: 778.479e6,
    eccentricity: 0.0487,
    inclinationDeg: 1.304,
    periodDays: 4332.589,
    longitudeOfPerihelionDeg: 14.728,
    meanAnomalyDeg: 20.02,
  },
  saturn: {
    obliquityDeg: 26.73,
    rotationHours: 10.656,
    semiMajorAxisKm: 1432.041e6,
    eccentricity: 0.052,
    inclinationDeg: 2.486,
    periodDays: 10759.22,
    longitudeOfPerihelionDeg: 92.599,
    meanAnomalyDeg: 317.02,
  },
  uranus: {
    obliquityDeg: 97.77,
    rotationHours: 17.24,
    semiMajorAxisKm: 2867.043e6,
    eccentricity: 0.0469,
    inclinationDeg: 0.77,
    periodDays: 30688.5,
    longitudeOfPerihelionDeg: 170.954,
    meanAnomalyDeg: 142.239,
  },
  neptune: {
    obliquityDeg: 28.32,
    rotationHours: 16.11,
    semiMajorAxisKm: 4514.953e6,
    eccentricity: 0.0097,
    inclinationDeg: 1.77,
    periodDays: 60182,
    longitudeOfPerihelionDeg: 44.965,
    meanAnomalyDeg: 256.228,
  },
  pluto: {
    obliquityDeg: 122.53,
    rotationHours: 153.2928,
    semiMajorAxisKm: 5869.656e6,
    eccentricity: 0.2444,
    inclinationDeg: 17.16,
    periodDays: 90560,
    longitudeOfPerihelionDeg: 224.067,
    meanAnomalyDeg: 14.53,
  },
  moon: {
    obliquityDeg: 6.68,
    rotationHours: 655.728,
    semiMajorAxisKm: 0.3844e6,
    eccentricity: 0.0549,
    inclinationDeg: 5.145,
    periodDays: 27.3217,
  },
}

const relativeTolerance = 0.02
const angleToleranceDeg = 0.5
const perihelionToleranceDeg = 1

function angularDifferenceDeg(a: number, b: number): number {
  const delta = Math.abs(((a - b) % 360) + 360) % 360
  return Math.min(delta, 360 - delta)
}

describe('shipped data against NASA reference values', () => {
  for (const [id, expected] of Object.entries(reference)) {
    describe(id, () => {
      const body = solarSystemFixture.byId.get(id)!
      const orbit = body.orbit!

      it('has the reference axial tilt (obliquity to orbit)', () => {
        expect(Math.abs(radToDeg(body.axialTilt) - expected.obliquityDeg)).toBeLessThan(
          angleToleranceDeg,
        )
      })

      it('has a positive sidereal rotation period close to the reference', () => {
        expect(body.rotationPeriodHours).toBeGreaterThan(0)
        expect(body.rotationPeriodHours).toBeCloseTo(
          expected.rotationHours,
          -Math.log10(expected.rotationHours * relativeTolerance),
        )
      })

      it('derives the rotation direction from the obliquity', () => {
        expect(body.rotationDirection).toBe(expected.obliquityDeg > 90 ? 'retrograde' : 'prograde')
      })

      it('has the reference orbit size, shape, inclination and period', () => {
        expect(orbit.semiMajorAxisKm / expected.semiMajorAxisKm).toBeCloseTo(1, 1)
        expect(Math.abs(orbit.eccentricity - expected.eccentricity)).toBeLessThan(0.005)
        expect(Math.abs(radToDeg(orbit.inclination) - expected.inclinationDeg)).toBeLessThan(
          angleToleranceDeg,
        )
        expect(orbit.periodDays / expected.periodDays).toBeCloseTo(1, 1)
      })

      if (expected.longitudeOfPerihelionDeg !== undefined) {
        it('points its perihelion in the reference direction (Ω + ω)', () => {
          const longitude = radToDeg(orbit.longAscendingNode + orbit.argOfPerihelion)
          expect(angularDifferenceDeg(longitude, expected.longitudeOfPerihelionDeg!)).toBeLessThan(
            perihelionToleranceDeg,
          )
        })
      }

      if (expected.meanAnomalyDeg !== undefined) {
        it('starts at the reference mean anomaly (J2000)', () => {
          expect(
            angularDifferenceDeg(radToDeg(orbit.meanAnomalyAtEpoch), expected.meanAnomalyDeg!),
          ).toBeLessThan(perihelionToleranceDeg)
        })
      }
    })
  }

  it('gives every body a positive rotation period and a direction consistent with its tilt', () => {
    for (const body of solarSystemFixture.byId.values()) {
      expect(body.rotationPeriodHours, body.id).toBeGreaterThan(0)
      expect(body.rotationDirection, body.id).toBe(
        radToDeg(body.axialTilt) > 90 ? 'retrograde' : 'prograde',
      )
    }
  })
})
