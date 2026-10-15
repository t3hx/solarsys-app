import { describe, expect, it } from 'vitest'
import { colors, tacticalColors } from '@/config/colors'
import { orbitLineDefaults, outlineConfig } from '@/config/rendering'
import { orbitAppearance } from '@/scene/orbits/orbitAppearance'

describe('orbitAppearance', () => {
  it('is white and dim by default', () => {
    expect(orbitAppearance('mars', null, false)).toEqual({
      color: colors.white,
      opacity: orbitLineDefaults.opacity,
    })
  })

  it('takes the body tactical color in tactical view', () => {
    expect(orbitAppearance('mars', null, true)).toEqual({
      color: tacticalColors.mars,
      opacity: orbitLineDefaults.tacticalOpacity,
    })
  })

  it('keeps hover and selection highlights above the tactical color', () => {
    expect(orbitAppearance('mars', 'hover', true)).toEqual({
      color: outlineConfig.hoverColor,
      opacity: orbitLineDefaults.highlightOpacity,
    })
    expect(orbitAppearance('mars', 'selected', false)).toEqual({
      color: outlineConfig.selectedColor,
      opacity: orbitLineDefaults.highlightOpacity,
    })
  })

  it('falls back to white for a body without tactical color', () => {
    expect(orbitAppearance('moon', null, true).color).toBe(colors.white)
  })
})
