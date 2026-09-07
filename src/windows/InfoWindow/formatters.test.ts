import { describe, expect, it } from 'vitest'
import {
  formatAu,
  formatEarthMasses,
  formatEarthRatio,
  formatNumber,
  formatPeriod,
} from '@/windows/InfoWindow/formatters'

describe('formatNumber', () => {
  it('writes scientific notation with a superscript exponent', () => {
    expect(formatNumber(5.972e24)).toBe('5.972 × 10²⁴')
    expect(formatNumber(1.66e22)).toBe('1.66 × 10²²')
  })

  it('groups large plain numbers and keeps small ones as they are', () => {
    expect(formatNumber(149_597_870)).toBe('149,597,870')
    expect(formatNumber(6371)).toBe('6371')
    expect(formatNumber(0.38)).toBe('0.38')
  })
})

describe('formatEarthMasses', () => {
  it('scales the precision with the value', () => {
    expect(formatEarthMasses(1.9e27)).toBe('318.2 M⊕')
    expect(formatEarthMasses(5.972e24)).toBe('1.00 M⊕')
    expect(formatEarthMasses(7.348e22)).toBe('0.012 M⊕')
    expect(formatEarthMasses(1.989e30)).toBe('333,054 M⊕')
    expect(formatEarthMasses(9.393e20)).toBe('1.57e-4 M⊕')
  })
})

describe('formatAu', () => {
  it('scales the precision with the distance', () => {
    expect(formatAu(149_597_870.7)).toBe('1.00 AU')
    expect(formatAu(1_433_530_000)).toBe('9.58 AU')
    expect(formatAu(4_498_252_900)).toBe('30.1 AU')
    expect(formatAu(15_000_000_000)).toBe('100 AU')
  })
})

describe('formatEarthRatio', () => {
  it('marks values close to Earth as roughly equal', () => {
    expect(formatEarthRatio(1)).toBe('≈×1')
    expect(formatEarthRatio(1.04)).toBe('≈×1')
  })

  it('writes multiples above and divisions below Earth', () => {
    expect(formatEarthRatio(11)).toBe('×11.0')
    expect(formatEarthRatio(318)).toBe('×318')
    expect(formatEarthRatio(2500)).toBe('×3K')
    expect(formatEarthRatio(0.38)).toBe('÷2.6')
    expect(formatEarthRatio(1e-7)).toBe('÷10M')
  })

  it('returns an empty string without a usable ratio', () => {
    expect(formatEarthRatio(undefined)).toBe('')
    expect(formatEarthRatio(0)).toBe('')
  })
})

describe('formatPeriod', () => {
  it('prints the value with its display unit, trimming trailing zeros', () => {
    expect(formatPeriod({ value: 11.86, unit: 'years' }, (key) => key)).toBe('11.86 metrics.years')
    expect(formatPeriod({ value: 88, unit: 'days' }, (key) => key)).toBe('88 metrics.days')
    expect(formatPeriod({ value: 4222.6, unit: 'hours' }, (key) => key)).toBe(
      '4222.6 metrics.hours',
    )
  })
})
