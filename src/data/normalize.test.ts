import { describe, expect, it } from 'vitest'
import rawData from '../../public/data/solar_system_data.json'
import { normalizeSolarSystem } from '@/data/normalize'
import { rawSolarSystemSchema } from '@/data/schema'
import { degToRad } from '@/physics/units'

const system = normalizeSolarSystem(rawSolarSystemSchema.parse(rawData))
const byId = system.byId

describe('normalizeSolarSystem', () => {
  it('produces the sun, 13 planets and their satellites, all indexed by id', () => {
    expect(system.sun.kind).toBe('star')
    expect(system.planets).toHaveLength(13)
    expect(byId.size).toBe(15)
    expect(byId.get('moon')?.kind).toBe('satellite')
    expect(byId.get('moon')?.parentId).toBe('earth')
    expect(byId.get('earth')?.satellites.map((s) => s.id)).toEqual(['moon'])
  })

  it('converts physical properties to numbers in SI units', () => {
    const earth = byId.get('earth')!
    expect(earth.radiusKm).toBe(6371)
    expect(earth.massKg).toBe(5.972e24)
    expect(earth.densityKgM3).toBe(5514)
    expect(earth.surfaceGravityG).toBe(1)
    expect(earth.oblateness).toBe(0.00335)
    expect(earth.axialTilt).toBeCloseTo(degToRad(23.4))
    expect(earth.lengthOfDayHours).toBe(24)
    expect(earth.temperature).toEqual({ minC: -89, meanC: 15, maxC: 58 })
  })

  it('keeps the display value and unit of periods and day lengths', () => {
    expect(byId.get('jupiter')!.orbit!.periodDisplay).toEqual({ value: 11.86, unit: 'years' })
    expect(byId.get('mercury')!.orbit!.periodDisplay).toEqual({ value: 88, unit: 'days' })
    expect(byId.get('mercury')!.lengthOfDayDisplay).toEqual({ value: 4222.6, unit: 'hours' })
    expect(byId.get('eris')!.lengthOfDayDisplay).toEqual({ value: 15.8, unit: 'days' })
  })

  it('normalizes rotation periods to signed hours', () => {
    expect(byId.get('venus')?.rotationPeriodHours).toBe(-5832)
    expect(byId.get('sun')?.rotationPeriodHours).toBeCloseTo(25.4 * 24)
    expect(byId.get('eris')?.rotationPeriodHours).toBeCloseTo(15.8 * 24)
  })

  it('normalizes orbital elements to km, days and radians', () => {
    const jupiter = byId.get('jupiter')!.orbit!
    expect(jupiter.semiMajorAxisKm).toBe(778_479_000)
    expect(jupiter.periodDays).toBeCloseTo(11.86 * 365.25)
    expect(jupiter.eccentricity).toBe(0.0489)
    expect(jupiter.inclination).toBeCloseTo(degToRad(1.8))
    expect(jupiter.longAscendingNode).toBeCloseTo(degToRad(100.464))
    expect(jupiter.argOfPerihelion).toBeCloseTo(degToRad(273.867))
    expect(jupiter.meanAnomalyAtEpoch).toBeCloseTo(degToRad(20.02))
  })

  it('leaves the sun without an orbit', () => {
    expect(system.sun.orbit).toBeUndefined()
  })

  it('drops empty texture paths and keeps the defined ones', () => {
    const earth = byId.get('earth')!
    expect(earth.textures.main).toBe('/textures/8k_earth_daymap.jpg')
    expect(earth.textures.night).toBe('/textures/8k_earth_nightmap.jpg')
    expect(earth.textures.rings).toBeUndefined()
    expect(byId.get('mercury')!.textures.day).toBeUndefined()
  })

  it('normalizes rings only when inner and outer radii are present', () => {
    expect(byId.get('earth')!.rings).toBeUndefined()
    expect(byId.get('saturn')!.rings).toEqual({
      innerRadiusKm: 74_500,
      outerRadiusKm: 140_220,
      texture: '/textures/8k_saturn_ring_alpha.png',
    })
    expect(byId.get('uranus')!.rings?.texture).toBeUndefined()
  })

  it('keeps identity metadata', () => {
    const pluto = byId.get('pluto')!
    expect(pluto.rank).toBe(9)
    expect(pluto.knownMoons).toBe(5)
    expect(pluto.rotationDirection).toBe('retrograde')
    expect(pluto.name).toBe('Pluto')
  })
})
