import { describe, expect, it } from 'vitest'
import { createRingGeometry } from '@/scene/bodies/ringGeometry'

describe('createRingGeometry', () => {
  const geometry = createRingGeometry(1.28, 2.41, 32)
  const position = geometry.getAttribute('position')
  const uv = geometry.getAttribute('uv')

  it('lies in the XZ plane (horizontal ring)', () => {
    for (let i = 0; i < position.count; i++) expect(Math.abs(position.getY(i))).toBeLessThan(1e-6)
  })

  it('maps U radially from the inner edge (0) to the outer edge (1) and keeps V at 0.5', () => {
    for (let i = 0; i < position.count; i++) {
      const r = Math.hypot(position.getX(i), position.getZ(i))
      const expectedU = (r - 1.28) / (2.41 - 1.28)
      expect(uv.getX(i)).toBeCloseTo(expectedU, 5)
      expect(uv.getY(i)).toBe(0.5)
    }
  })

  it('spans exactly the requested radii', () => {
    const radii = Array.from({ length: position.count }, (_, i) =>
      Math.hypot(position.getX(i), position.getZ(i)),
    )
    expect(Math.min(...radii)).toBeCloseTo(1.28, 5)
    expect(Math.max(...radii)).toBeCloseTo(2.41, 5)
  })
})
