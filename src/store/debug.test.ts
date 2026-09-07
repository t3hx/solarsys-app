import { beforeEach, describe, expect, it } from 'vitest'
import { useDebugStore } from '@/store/debug'

const store = () => useDebugStore.getState()
const bodies = ['sun', 'earth', 'moon']
const orbits = ['earth', 'moon']

describe('debug store', () => {
  beforeEach(() => store().reset())

  it('starts with every helper off', () => {
    expect(store().isWireframe('earth')).toBe(false)
    expect(store().hasBodyAxes('earth')).toBe(false)
    expect(store().hasBodyGrid('earth')).toBe(false)
    expect(store().hasOrbitAxes('earth')).toBe(false)
    expect(store().hasOrbitGrid('earth')).toBe(false)
    expect(store()).toMatchObject({ globalWireframe: false, globalAxes: false, globalGrids: false })
  })

  it('toggles a single body flag', () => {
    store().toggleWireframe('earth')
    expect(store().isWireframe('earth')).toBe(true)
    expect(store().isWireframe('moon')).toBe(false)
    store().toggleWireframe('earth')
    expect(store().isWireframe('earth')).toBe(false)
  })

  it('toggles body and orbit helpers independently', () => {
    store().toggleBodyAxes('earth')
    store().toggleOrbitGrid('earth')
    expect(store().hasBodyAxes('earth')).toBe(true)
    expect(store().hasBodyGrid('earth')).toBe(false)
    expect(store().hasOrbitGrid('earth')).toBe(true)
    expect(store().hasOrbitAxes('earth')).toBe(false)
  })

  it('global wireframe forces every body to the same state, even ones toggled individually', () => {
    store().toggleWireframe('moon')
    store().toggleGlobalWireframe(bodies)
    expect(store().globalWireframe).toBe(true)
    expect(bodies.every((id) => store().isWireframe(id))).toBe(true)
    store().toggleGlobalWireframe(bodies)
    expect(store().globalWireframe).toBe(false)
    expect(bodies.some((id) => store().isWireframe(id))).toBe(false)
  })

  it('global axes and grids force bodies and orbits together', () => {
    store().toggleGlobalAxes(bodies, orbits)
    expect(bodies.every((id) => store().hasBodyAxes(id))).toBe(true)
    expect(orbits.every((id) => store().hasOrbitAxes(id))).toBe(true)
    store().toggleGlobalGrids(bodies, orbits)
    expect(bodies.every((id) => store().hasBodyGrid(id))).toBe(true)
    expect(orbits.every((id) => store().hasOrbitGrid(id))).toBe(true)
  })
})
