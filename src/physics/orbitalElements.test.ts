import { describe, expect, it } from 'vitest'
import { convertOrbitalElements } from '@/physics/orbitalElements'
import { degToRad, radToDeg } from '@/physics/units'

describe('convertOrbitalElements', () => {
  it('is the identity when the new reference plane is not tilted (i > 0)', () => {
    const result = convertOrbitalElements(
      { inclination: degToRad(7), longAscendingNode: degToRad(48.3) },
      0,
    )
    expect(radToDeg(result.inclination)).toBeCloseTo(7, 6)
    expect(radToDeg(result.longAscendingNode)).toBeCloseTo(48.3, 6)
  })

  it('tilts an orbit lying in the old plane by the new plane inclination', () => {
    const result = convertOrbitalElements({ inclination: 0, longAscendingNode: 0 }, degToRad(7.25))
    expect(radToDeg(result.inclination)).toBeCloseTo(7.25, 6)
    // * Le noeud ascendant de l'ancien plan vu du nouveau est a l'oppose de celui du nouveau plan
    expect(radToDeg(result.longAscendingNode)).toBeCloseTo(180, 6)
  })

  it('matches the reference values for Mercury and Pluto seen from the solar equator', () => {
    // * Valeurs de reference calculees a partir de la normale de l'orbite (voir module)
    const mercury = convertOrbitalElements(
      { inclination: degToRad(7), longAscendingNode: degToRad(48.3) },
      degToRad(7.25),
    )
    expect(radToDeg(mercury.inclination)).toBeCloseTo(5.822, 3)
    expect(radToDeg(mercury.longAscendingNode)).toBeCloseTo(116.2312, 3)

    const pluto = convertOrbitalElements(
      { inclination: degToRad(17.16), longAscendingNode: degToRad(110.299) },
      degToRad(7.25),
    )
    expect(radToDeg(pluto.inclination)).toBeCloseTo(20.7834, 3)
    expect(radToDeg(pluto.longAscendingNode)).toBeCloseTo(128.7536, 3)
  })

  it('returns an inclination in [0, pi] and a node in (-pi, pi]', () => {
    for (const i of [0, 30, 90, 150, 180]) {
      for (const node of [0, 90, 180, 270, 359]) {
        const r = convertOrbitalElements(
          { inclination: degToRad(i), longAscendingNode: degToRad(node) },
          degToRad(23.4),
        )
        expect(r.inclination).toBeGreaterThanOrEqual(0)
        expect(r.inclination).toBeLessThanOrEqual(Math.PI + 1e-9)
        expect(r.longAscendingNode).toBeGreaterThan(-Math.PI - 1e-9)
        expect(r.longAscendingNode).toBeLessThanOrEqual(Math.PI + 1e-9)
      }
    }
  })
})
