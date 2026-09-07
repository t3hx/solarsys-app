import { beforeEach, describe, expect, it } from 'vitest'
import { i18n, LOCALE_STORAGE_KEY, supportedLocales } from '@/i18n'

describe('i18n', () => {
  beforeEach(async () => {
    localStorage.clear()
    await i18n.changeLanguage('en')
  })

  it('supports English and French, English by default', () => {
    expect(supportedLocales).toEqual(['en', 'fr'])
    expect(i18n.language).toBe('en')
    expect(i18n.t('hud.zoomLevel')).toBe('ZOOM LEVEL')
  })

  it('switches language and persists the choice', async () => {
    await i18n.changeLanguage('fr')
    expect(i18n.t('hud.zoomLevel')).toBe('NIVEAU DE ZOOM')
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('fr')
  })

  it('exposes translated body names with a fallback check', () => {
    expect(i18n.exists('bodies.earth.name')).toBe(true)
    expect(i18n.t('bodies.earth.name')).toBe('Earth')
    expect(i18n.exists('bodies.vulcan.name')).toBe(false)
  })

  it('interpolates the rank ordinal', () => {
    expect(i18n.t('metrics.ordinal', { rank: 3 })).toBe('#3')
  })
})
