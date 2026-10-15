import { describe, expect, it } from 'vitest'
import en from '@/i18n/locales/en.json'
import fr from '@/i18n/locales/fr.json'

function flatten(value: unknown, prefix = ''): Record<string, string> {
  if (typeof value === 'string') return { [prefix]: value }
  if (Array.isArray(value)) {
    return Object.assign({}, ...value.map((item, i) => flatten(item, `${prefix}[${i}]`)))
  }
  return Object.assign(
    {},
    ...Object.entries(value as Record<string, unknown>).map(([key, child]) =>
      flatten(child, prefix ? `${prefix}.${key}` : key),
    ),
  )
}

describe('locales', () => {
  const flatEn = flatten(en)
  const flatFr = flatten(fr)

  it('have the same keys in English and French', () => {
    expect(Object.keys(flatFr).sort()).toEqual(Object.keys(flatEn).sort())
  })

  it('no longer mention the previous product name', () => {
    for (const text of [...Object.values(flatEn), ...Object.values(flatFr)]) {
      expect(text).not.toMatch(/celestial walker/i)
    }
    expect(flatEn['tutorial.steps.welcome.description']).toMatch(/solarsys/)
  })

  it('drop the keys that nothing reads any more', () => {
    for (const key of ['drawer.title', 'drawer.celestialOrbits', 'lang.en', 'lang.fr']) {
      expect(flatEn[key]).toBeUndefined()
    }
  })
})
