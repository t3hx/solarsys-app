import { describe, expect, it } from 'vitest'
import { outlineTarget } from '@/scene/effects/outlineTarget'

describe('outlineTarget', () => {
  it('is empty when nothing is hovered or selected', () => {
    expect(outlineTarget({ hoveredId: null, selectedId: null, isFollowing: false })).toBeNull()
  })

  it('outlines the hovered body in the hover color', () => {
    expect(outlineTarget({ hoveredId: 'mars', selectedId: null, isFollowing: false })).toEqual({
      id: 'mars',
      kind: 'hover',
    })
  })

  it('gives priority to the selected body, in the selection color', () => {
    expect(outlineTarget({ hoveredId: 'mars', selectedId: 'earth', isFollowing: false })).toEqual({
      id: 'earth',
      kind: 'selected',
    })
  })

  it('shows nothing while the camera is following: the focus is the indicator', () => {
    expect(outlineTarget({ hoveredId: null, selectedId: 'earth', isFollowing: true })).toBeNull()
  })
})
