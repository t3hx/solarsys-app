import { Group, Mesh } from 'three'
import { describe, expect, it } from 'vitest'
import type { BodyEntry, OrbitEntry } from '@/scene/registry'
import { createRegistry } from '@/scene/registry'

function bodyEntry(id: string): BodyEntry {
  return { id, mesh: new Mesh(), rotationSpeed: 1 }
}

function orbitEntry(id: string): OrbitEntry {
  return {
    id,
    mover: new Group(),
    orbit: {
      semiMajorAxis: 10,
      eccentricity: 0,
      argOfPerihelion: 0,
      meanAnomalyAtEpoch: 0,
      periodDays: 10,
    },
  }
}

describe('createRegistry', () => {
  it('registers bodies and orbits and lists them', () => {
    const registry = createRegistry()
    registry.registerBody(bodyEntry('earth'))
    registry.registerOrbit(orbitEntry('earth'))
    expect(registry.getBody('earth')?.id).toBe('earth')
    expect([...registry.bodies()].map((b) => b.id)).toEqual(['earth'])
    expect([...registry.orbits()].map((o) => o.id)).toEqual(['earth'])
  })

  it('returns an unregister function that only removes its own entry', () => {
    const registry = createRegistry()
    const first = bodyEntry('mars')
    const second = bodyEntry('mars')
    const unregisterFirst = registry.registerBody(first)
    registry.registerBody(second)
    // * StrictMode : le cleanup du premier montage ne doit pas retirer le second
    unregisterFirst()
    expect(registry.getBody('mars')).toBe(second)
  })

  it('is empty after unregistering', () => {
    const registry = createRegistry()
    const unregister = registry.registerOrbit(orbitEntry('moon'))
    unregister()
    expect([...registry.orbits()]).toHaveLength(0)
  })
})
