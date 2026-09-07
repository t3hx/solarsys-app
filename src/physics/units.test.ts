import { describe, expect, it } from 'vitest'
import {
  DAYS_PER_YEAR,
  degToRad,
  EARTH_MASS_KG,
  HOURS_PER_DAY,
  KM_PER_AU,
  kmToAu,
  parseTimeUnit,
  radToDeg,
  toDays,
  toHours,
} from '@/physics/units'

describe('units', () => {
  it('exposes the reference constants', () => {
    expect(KM_PER_AU).toBeCloseTo(149_597_870.7, 1)
    expect(EARTH_MASS_KG).toBe(5.972e24)
    expect(HOURS_PER_DAY).toBe(24)
    expect(DAYS_PER_YEAR).toBe(365.25)
  })

  it('converts periods to hours', () => {
    expect(toHours(23.9, 'hours')).toBe(23.9)
    expect(toHours(15.8, 'days')).toBeCloseTo(379.2)
    expect(toHours(1, 'years')).toBeCloseTo(8766)
  })

  it('converts periods to days', () => {
    expect(toDays(365.25, 'days')).toBe(365.25)
    expect(toDays(11.86, 'years')).toBeCloseTo(4331.865)
    expect(toDays(48, 'hours')).toBe(2)
  })

  it('keeps the sign of retrograde periods', () => {
    expect(toHours(-5832, 'hours')).toBe(-5832)
    expect(toDays(-1, 'years')).toBe(-365.25)
  })

  it('parses unit strings case-insensitively with a fallback', () => {
    expect(parseTimeUnit('Days', 'hours')).toBe('days')
    expect(parseTimeUnit('YEARS', 'days')).toBe('years')
    expect(parseTimeUnit(undefined, 'hours')).toBe('hours')
    expect(parseTimeUnit('fortnights', 'days')).toBe('days')
  })

  it('converts kilometres to astronomical units', () => {
    expect(kmToAu(KM_PER_AU)).toBe(1)
    expect(kmToAu(149_597_870)).toBeCloseTo(1, 5)
  })

  it('converts degrees and radians both ways', () => {
    expect(degToRad(180)).toBeCloseTo(Math.PI)
    expect(radToDeg(Math.PI / 2)).toBeCloseTo(90)
  })
})
