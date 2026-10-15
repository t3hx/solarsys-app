import { describe, expect, it } from 'vitest'
import { tacticalColors } from '@/config/colors'

const HELIOCENTRIC_IDS = [
  'mercury',
  'venus',
  'earth',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
  'ceres',
  'haumea',
  'makemake',
  'eris',
]

function channels(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]
}

describe('tacticalColors', () => {
  it('assigns a 6-digit hex color to every heliocentric body', () => {
    for (const id of HELIOCENTRIC_IDS) {
      expect(tacticalColors[id], id).toMatch(/^#[0-9A-F]{6}$/i)
    }
  })

  it('stays readable on a black background (perceived luminance)', () => {
    for (const id of HELIOCENTRIC_IDS) {
      const [r, g, b] = channels(tacticalColors[id])
      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
      expect(luminance, `${id} is too dark`).toBeGreaterThan(90)
    }
  })

  it('follows the expected color logic for the well-known planets', () => {
    const [mr, mg, mb] = channels(tacticalColors.mars)
    expect(mr).toBeGreaterThan(mg)
    expect(mr).toBeGreaterThan(mb)

    const [er, eg, eb] = channels(tacticalColors.earth)
    expect(eg).toBeGreaterThan(er)
    expect(eg).toBeGreaterThan(eb)

    const [nr, ng, nb] = channels(tacticalColors.neptune)
    expect(nb).toBeGreaterThan(nr)
    expect(nb).toBeGreaterThan(ng)

    // * Uranus cyan : vert et bleu proches et dominants
    const [ur, ug, ub] = channels(tacticalColors.uranus)
    expect(ug).toBeGreaterThan(ur)
    expect(ub).toBeGreaterThan(ur)

    // * Venus jaune : rouge et vert hauts, bleu bas
    const [vr, vg, vb] = channels(tacticalColors.venus)
    expect(vr).toBeGreaterThan(vb)
    expect(vg).toBeGreaterThan(vb)
  })
})
