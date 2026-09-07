import { describe, expect, it } from 'vitest'
import rawData from '../../public/data/solar_system_data.json'
import { allBodies, findBody, parentOf } from '@/data/lookup'
import { normalizeSolarSystem } from '@/data/normalize'
import { rawSolarSystemSchema } from '@/data/schema'

const system = normalizeSolarSystem(rawSolarSystemSchema.parse(rawData))

describe('lookup', () => {
  it('finds any body by id, or returns undefined', () => {
    expect(findBody(system, 'sun')?.kind).toBe('star')
    expect(findBody(system, 'moon')?.name).toBe('Moon')
    expect(findBody(system, 'vulcan')).toBeUndefined()
  })

  it('lists all bodies depth-first: sun, then each planet followed by its satellites', () => {
    const ids = allBodies(system).map((b) => b.id)
    expect(ids[0]).toBe('sun')
    expect(ids.indexOf('moon')).toBe(ids.indexOf('earth') + 1)
    expect(ids).toHaveLength(15)
  })

  it('resolves the parent of a satellite and none for planets and the sun', () => {
    expect(parentOf(system, 'moon')?.id).toBe('earth')
    expect(parentOf(system, 'earth')).toBeUndefined()
    expect(parentOf(system, 'sun')).toBeUndefined()
  })
})
