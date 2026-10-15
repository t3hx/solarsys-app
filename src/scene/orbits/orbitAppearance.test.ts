import { describe, expect, it } from 'vitest'
import { colors, tacticalColors } from '@/config/colors'
import { orbitLineDefaults, outlineConfig } from '@/config/rendering'
import { orbitAppearance } from '@/scene/orbits/orbitAppearance'

describe('orbitAppearance', () => {
  it('is white and dim by default', () => {
    expect(orbitAppearance('mars', null, false, null)).toEqual({
      color: colors.white,
      opacity: orbitLineDefaults.opacity,
    })
  })

  it('takes the body tactical color in tactical view', () => {
    expect(orbitAppearance('mars', null, true, null)).toEqual({
      color: tacticalColors.mars,
      opacity: orbitLineDefaults.tacticalOpacity,
    })
  })

  it('blazes in the body color at full opacity when hovered in tactical view', () => {
    expect(orbitAppearance('mars', 'hover', true, 'mars')).toEqual({
      color: tacticalColors.mars,
      opacity: 1,
    })
  })

  it('dims the other orbits while one body is hovered in tactical view', () => {
    expect(orbitAppearance('venus', null, true, 'mars')).toEqual({
      color: tacticalColors.venus,
      opacity: orbitLineDefaults.tacticalDimmedOpacity,
    })
  })

  it('keeps the classic highlights outside tactical view', () => {
    expect(orbitAppearance('mars', 'hover', false, 'mars')).toEqual({
      color: outlineConfig.hoverColor,
      opacity: orbitLineDefaults.highlightOpacity,
    })
    expect(orbitAppearance('mars', 'selected', false, null)).toEqual({
      color: outlineConfig.selectedColor,
      opacity: orbitLineDefaults.highlightOpacity,
    })
  })

  it('falls back to white for a body without tactical color', () => {
    expect(orbitAppearance('moon', null, true, null).color).toBe(colors.white)
  })
})
