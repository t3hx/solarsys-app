import { describe, expect, it } from 'vitest'
import { materialDefaults } from '@/config/rendering'
import { bodyFeatures, materialPreset } from '@/scene/bodies/bodyFeatures'
import { solarSystemFixture } from '@/test/fixtures/solarSystem'

const body = (id: string) => solarSystemFixture.byId.get(id)!

describe('bodyFeatures', () => {
  it('activates every feature declared by Earth textures', () => {
    expect(bodyFeatures(body('earth'))).toEqual({
      dayNight: true,
      nightLights: true,
      clouds: true,
      atmosphere: false,
      rings: false,
      specular: true,
      normal: true,
      bump: false,
    })
  })

  it('activates only the atmosphere for Venus and only the bump map for Pluto', () => {
    expect(bodyFeatures(body('venus'))).toMatchObject({
      atmosphere: true,
      clouds: false,
      dayNight: false,
    })
    expect(bodyFeatures(body('pluto'))).toMatchObject({ bump: true, normal: false, rings: false })
  })

  it('activates rings from the physical properties, with or without a texture', () => {
    expect(bodyFeatures(body('saturn')).rings).toBe(true)
    expect(bodyFeatures(body('uranus')).rings).toBe(true)
    expect(bodyFeatures(body('jupiter')).rings).toBe(false)
  })

  it('activates nothing for Mercury', () => {
    expect(Object.values(bodyFeatures(body('mercury'))).some(Boolean)).toBe(false)
  })
})

describe('materialPreset', () => {
  it('prefers the day/night preset, then the atmosphere preset, then the kind preset', () => {
    expect(materialPreset(body('earth'))).toBe(materialDefaults.dayNight)
    expect(materialPreset(body('venus'))).toBe(materialDefaults.atmosphere)
    expect(materialPreset(body('mars'))).toBe(materialDefaults.planet)
    expect(materialPreset(body('moon'))).toBe(materialDefaults.satellite)
  })
})
