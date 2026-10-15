import { describe, expect, it } from 'vitest'
import { angularSpeedFromPeriodHours } from '@/physics/rotation'

describe('angularSpeedFromPeriodHours', () => {
  it('gives one turn per simulated day for Earth', () => {
    // * 23.934 h → 2 pi rad par jour sideral
    expect(angularSpeedFromPeriodHours(23.934)).toBeCloseTo(6.301, 3)
  })

  it('gives one turn per 25.38 days for the Sun', () => {
    expect(angularSpeedFromPeriodHours(25.38 * 24)).toBeCloseTo((2 * Math.PI) / 25.38, 6)
  })

  it('is negative for retrograde rotation', () => {
    expect(angularSpeedFromPeriodHours(-5832)).toBeCloseTo(-0.02586, 4)
  })

  it('returns zero for a null or invalid period', () => {
    expect(angularSpeedFromPeriodHours(0)).toBe(0)
    expect(angularSpeedFromPeriodHours(Number.NaN)).toBe(0)
  })
})
