import { describe, expect, it } from 'vitest'
import { i18n } from '@/i18n'
import { solarSystemFixture } from '@/test/fixtures/solarSystem'
import { buildMetrics } from '@/windows/InfoWindow/buildMetrics'

const body = (id: string) => solarSystemFixture.byId.get(id)!
const earth = body('earth')
const metrics = (id: string) => buildMetrics(body(id), earth, i18n)
const byLabel = (id: string, label: string) => metrics(id).find((m) => m.label === label)

describe('buildMetrics', () => {
  it('describes Earth without Earth ratios', () => {
    const items = metrics('earth')
    expect(items.map((m) => m.label)).toEqual([
      'Rank',
      'Type',
      'Radius',
      'Mass',
      'Density',
      'Gravity',
      'Dist. to Sun',
      'Orbital period',
      'Day length',
      'Rotation',
      'Temperature',
      'Winds',
      'Seasons',
      'Moons',
      'Rings',
    ])
    expect(items.every((m) => m.earthRatio === undefined)).toBe(true)
    expect(byLabel('earth', 'Rank')?.value).toBe('#3')
    expect(byLabel('earth', 'Mass')?.value).toBe('1.00 M⊕')
    expect(byLabel('earth', 'Mass')?.detail).toBe('5.972 × 10²⁴ kg')
    expect(byLabel('earth', 'Temperature')?.value).toBe('-89/58°C')
    expect(byLabel('earth', 'Moons')?.value).toBe('1')
    expect(byLabel('earth', 'Rings')?.value).toBe('No')
  })

  it('compares Jupiter with Earth and keeps the period unit of the data', () => {
    expect(byLabel('jupiter', 'Radius')?.earthRatio).toBeCloseTo(69911 / 6371, 6)
    expect(byLabel('jupiter', 'Orbital period')?.value).toBe('11.86 years')
    expect(byLabel('jupiter', 'Orbital period')?.earthRatio).toBeCloseTo(11.86, 6)
    expect(byLabel('jupiter', 'Dist. to Sun')?.value).toBe('5.20 AU')
    expect(byLabel('jupiter', 'Dist. to Sun')?.detail).toBe('778,479,000 km')
    expect(byLabel('jupiter', 'Day length')?.value).toBe('9.9 hours')
    expect(byLabel('jupiter', 'Rings')?.value).toBe('No')
    expect(byLabel('saturn', 'Rings')?.value).toBe('Yes')
  })

  it('shows a single temperature when the range is flat, and the day length in days for Eris', () => {
    expect(byLabel('jupiter', 'Temperature')?.value).toBe('-110°C')
    expect(byLabel('eris', 'Day length')?.value).toBe('15.8 days')
    expect(byLabel('eris', 'Day length')?.earthRatio).toBeCloseTo((15.8 * 24) / 24, 6)
  })

  it('skips the rank and orbit metrics for the Sun', () => {
    const labels = metrics('sun').map((m) => m.label)
    expect(labels).not.toContain('Rank')
    expect(labels).not.toContain('Dist. to Sun')
    expect(labels).not.toContain('Orbital period')
    expect(byLabel('sun', 'Moons')?.value).toBe('None')
    expect(byLabel('sun', 'Type')?.value).toBe('Yellow dwarf star')
  })

  it('uses the translated labels of the current language', async () => {
    await i18n.changeLanguage('fr')
    expect(metrics('mars').map((m) => m.label)).toContain('Rayon')
    await i18n.changeLanguage('en')
  })
})
