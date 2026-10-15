import { describe, expect, it } from 'vitest'
import { formatAppVersion } from '@/hud/drawer/appVersion'

describe('formatAppVersion', () => {
  it('keeps a release tag as-is', () => {
    expect(formatAppVersion('v1.0.0')).toBe('v1.0.0')
  })

  it('shortens a preprod build to its 7-char sha', () => {
    expect(formatAppVersion('dev-4b736741b2232704e9b3e1a540dc4430ea4c8dad')).toBe('dev-4b73674')
  })

  it('keeps a plain dev build as-is', () => {
    expect(formatAppVersion('dev')).toBe('dev')
  })

  it('falls back to dev when empty', () => {
    expect(formatAppVersion('')).toBe('dev')
  })
})
