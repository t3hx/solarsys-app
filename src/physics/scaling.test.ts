import { describe, expect, it } from 'vitest'
import {
  bodyRadiusToUnits,
  effectiveOrbitRadius,
  localOrbitalDistanceToUnits,
  orbitalDistanceToUnits,
  starRadiusToUnits,
} from '@/physics/scaling'
import { KM_PER_AU } from '@/physics/units'

describe('scaling', () => {
  it('scales planet radii so that Jupiter is 15 units', () => {
    expect(bodyRadiusToUnits(69_911)).toBeCloseTo(15, 9)
    expect(bodyRadiusToUnits(6_371)).toBeCloseTo(1.367, 3)
    expect(bodyRadiusToUnits(1_737.4)).toBeCloseTo(0.373, 3)
  })

  it('scales the Sun on its own scale to 75 units', () => {
    expect(starRadiusToUnits(696_340)).toBeCloseTo(75, 9)
  })

  it('scales planetary orbital distances so that 1 AU is 250 units', () => {
    expect(orbitalDistanceToUnits(KM_PER_AU)).toBeCloseTo(250, 6)
    expect(orbitalDistanceToUnits(5 * KM_PER_AU)).toBeCloseTo(1250, 6)
  })

  it('scales satellite orbital distances on the compact local scale', () => {
    expect(localOrbitalDistanceToUnits(384_400)).toBeCloseTo(3.844, 6)
  })

  it('adds the central body radius to the effective orbit radius', () => {
    expect(effectiveOrbitRadius(KM_PER_AU, 75)).toBeCloseTo(325, 6)
    expect(effectiveOrbitRadius(384_400, 1.367, { local: true })).toBeCloseTo(5.211, 3)
  })
})
