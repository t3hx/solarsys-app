import { describe, expect, it } from 'vitest'
import { LEADER_LENGTH, labelPlacement, leaderLength } from '@/scene/labels/labelPlacement'

describe('labelPlacement', () => {
  it('points right when the body is right of the screen center', () => {
    const p = labelPlacement(0.5, 0)
    expect(p.angle).toBeCloseTo(0)
    expect(p.dx).toBeCloseTo(LEADER_LENGTH)
    expect(p.dy).toBeCloseTo(0)
    expect(p.shiftX).toBe('0')
  })

  it('points up when the body is above the screen center (NDC y inverted)', () => {
    const p = labelPlacement(0, 0.5)
    expect(p.angle).toBeCloseTo(-Math.PI / 2)
    expect(p.dx).toBeCloseTo(0)
    expect(p.dy).toBeCloseTo(-LEADER_LENGTH)
    // * La boite s'etend au-dessus du bout de la tige
    expect(p.shiftY).toBe('-100%')
  })

  it('shifts the box left of the leader when pointing left', () => {
    const p = labelPlacement(-0.5, 0)
    // * atan2 peut rendre ±π pour la meme direction
    expect(Math.abs(p.angle)).toBeCloseTo(Math.PI)
    expect(p.shiftX).toBe('-100%')
  })

  it('stretches by a custom leader length', () => {
    const p = labelPlacement(0.5, 0, 120)
    expect(p.dx).toBeCloseTo(120)
  })

  it('falls back to a diagonal when the body sits at the center', () => {
    const p = labelPlacement(0, 0)
    expect(Math.hypot(p.dx, p.dy)).toBeCloseTo(LEADER_LENGTH)
    expect(p.dx).toBeGreaterThan(0)
    expect(p.dy).toBeLessThan(0)
  })
})

describe('labelPlacement angle offset', () => {
  it('rotates the leader direction by the given offset', () => {
    const p = labelPlacement(0.5, 0, LEADER_LENGTH, Math.PI / 2)
    // * Droite tournee de 90° en espace ecran : vers le bas
    expect(p.dx).toBeCloseTo(0)
    expect(p.dy).toBeCloseTo(LEADER_LENGTH)
  })
})

describe('leaderLength', () => {
  it('is longest for the innermost body and settles at the base length outward', () => {
    expect(leaderLength(0)).toBeGreaterThan(leaderLength(3))
    expect(leaderLength(3)).toBeGreaterThan(leaderLength(6))
    expect(leaderLength(7)).toBe(LEADER_LENGTH)
    expect(leaderLength(12)).toBe(LEADER_LENGTH)
  })
})
