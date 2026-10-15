import { describe, expect, it } from 'vitest'
import { borderPaths } from '@/windows/borderPaths'

describe('borderPaths', () => {
  it('returns eight segments alternating edges and rounded corners', () => {
    const paths = borderPaths(200, 100, 12)
    expect(paths).toHaveLength(8)
    // * Bords : lignes horizontales (H) ou verticales (V) ; coins : arcs (A)
    expect(paths[0]).toMatch(/^M 12,0\.5 H 188$/)
    expect(paths[1]).toMatch(/^M 188,0\.5 A 11\.5,11\.5 0 0 1 199\.5,12$/)
    expect(paths[2]).toMatch(/^M 199\.5,12 V 88$/)
    expect(paths[4]).toMatch(/^M 188,99\.5 H 12$/)
    expect(paths[6]).toMatch(/^M 0\.5,88 V 12$/)
    for (const index of [1, 3, 5, 7]) expect(paths[index]).toContain(' A ')
  })

  it('clamps the radius to half the smallest side', () => {
    const paths = borderPaths(40, 100, 50)
    expect(paths[0]).toBe('M 20,0.5 H 20')
  })

  it('returns no path for a degenerate box', () => {
    expect(borderPaths(0, 100, 12)).toEqual([])
    expect(borderPaths(100, 0, 12)).toEqual([])
  })

  it('treats a NaN radius as square corners', () => {
    expect(borderPaths(100, 50, Number.NaN)[0]).toBe('M 0,0.5 H 100')
  })
})
