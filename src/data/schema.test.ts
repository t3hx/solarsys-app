import { describe, expect, it } from 'vitest'
import rawData from '../../public/data/solar_system_data.json'
import { rawSolarSystemSchema } from '@/data/schema'

describe('rawSolarSystemSchema', () => {
  it('accepts the shipped solar_system_data.json as-is', () => {
    const result = rawSolarSystemSchema.safeParse(rawData)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.sun.id).toBe('sun')
    expect(Object.keys(result.data.planets)).toHaveLength(13)
    expect(result.data.planets.earth?.satellites?.moon?.id).toBe('moon')
  })

  it('rejects a body without an id', () => {
    const broken = structuredClone(rawData) as { sun: Record<string, unknown> }
    delete broken.sun.id
    expect(rawSolarSystemSchema.safeParse(broken).success).toBe(false)
  })

  it('rejects a planet whose physical properties are missing', () => {
    const broken = structuredClone(rawData) as { planets: Record<string, Record<string, unknown>> }
    delete broken.planets.mars!.physicalProps
    expect(rawSolarSystemSchema.safeParse(broken).success).toBe(false)
  })

  it('accepts both empty rings and full ring definitions', () => {
    const result = rawSolarSystemSchema.safeParse(rawData)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.planets.earth?.physicalProps.rings).toEqual({})
    expect(result.data.planets.saturn?.physicalProps.rings).toMatchObject({ innerRadius: '74500' })
  })
})
