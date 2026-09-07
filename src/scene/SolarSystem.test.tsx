import type * as Drei from '@react-three/drei'
import ReactThreeTestRenderer from '@react-three/test-renderer'
import type { Object3D } from 'three'
import { Texture } from 'three'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { orbitalPosition } from '@/physics/kepler'
import { angularSpeedFromPeriodHours } from '@/physics/rotation'
import { RegistryProvider, createRegistry } from '@/scene/registry'
import { SimulationDriver } from '@/scene/simulation/SimulationDriver'
import { SolarSystem } from '@/scene/SolarSystem'
import { useSimulationStore } from '@/store/simulation'
import { solarSystemFixture } from '@/test/fixtures/solarSystem'

// * Les textures ne se chargent pas sous jsdom : useTexture renvoie une texture vide
vi.mock('@react-three/drei', async (importOriginal) => {
  const actual = await importOriginal<typeof Drei>()
  const useTexture = Object.assign(() => new Texture(), { preload: () => undefined })
  return { ...actual, useTexture }
})

const system = solarSystemFixture

function mount(registry = createRegistry()) {
  return ReactThreeTestRenderer.create(
    <RegistryProvider registry={registry}>
      <SolarSystem system={system} />
      <SimulationDriver />
    </RegistryProvider>,
  )
}

describe('SolarSystem', () => {
  beforeEach(() => {
    useSimulationStore.getState().reset()
  })

  it('renders one mesh per body, named after the body', async () => {
    const renderer = await mount()
    const meshes = renderer.scene.findAll(
      (node) => node.type === 'Mesh' && node.props.userData?.type === 'celestial-body',
    )
    expect(meshes).toHaveLength(15)
    const names = meshes.map((m) => (m.instance as Object3D).name).sort()
    expect(names).toContain('Earth')
    expect(names).toContain('Moon')
    expect(names).toContain('Sun')
    await renderer.unmount()
  })

  it('builds the orbital plane → orbit → system hierarchy and nests satellites', async () => {
    const renderer = await mount()
    const earthPlane = renderer.scene.findByProps({ name: 'Earth Orbital Plane' })
    const earthOrbit = earthPlane.findByProps({ name: 'Earth Orbit' })
    const earthSystem = earthOrbit.findByProps({ name: 'Earth System' })
    expect(earthSystem.findByProps({ name: 'Earth' })).toBeDefined()
    expect(earthSystem.findByProps({ name: 'Moon Orbital Plane' })).toBeDefined()
    await renderer.unmount()
  })

  it('draws one orbit line per orbiting body', async () => {
    const renderer = await mount()
    const lines = renderer.scene.findAll((node) => node.instance.userData?.type === 'orbit-line')
    expect(lines).toHaveLength(14)
    await renderer.unmount()
  })

  it('registers every body and every orbit', async () => {
    const registry = createRegistry()
    const renderer = await mount(registry)
    expect([...registry.bodies()]).toHaveLength(15)
    expect([...registry.orbits()]).toHaveLength(14)
    expect(registry.getBody('venus')?.rotationSpeed).toBeLessThan(0)
    await renderer.unmount()
    expect([...registry.bodies()]).toHaveLength(0)
  })

  it('moves each system along its Kepler orbit as simulated time advances', async () => {
    const registry = createRegistry()
    const renderer = await mount(registry)
    useSimulationStore.getState().setSpeed(10)
    const frames = 6
    const delta = 0.5
    await renderer.advanceFrames(frames, delta)

    const earth = registry.getOrbit('earth')!
    const expected = orbitalPosition(earth.orbit, frames * delta * 10)
    expect(earth.mover.position.x).toBeCloseTo(expected.x, 4)
    expect(earth.mover.position.z).toBeCloseTo(expected.z, 4)
    await renderer.unmount()
  })

  it('spins bodies around their axis, backwards for Venus', async () => {
    const registry = createRegistry()
    const renderer = await mount(registry)
    await renderer.advanceFrames(4, 0.25)
    const venus = registry.getBody('venus')!
    const expected = angularSpeedFromPeriodHours(-5832) * 1
    expect(venus.mesh.rotation.y).toBeCloseTo(expected, 6)
    expect(venus.mesh.rotation.y).toBeLessThan(0)
    await renderer.unmount()
  })

  it('freezes everything while paused', async () => {
    const registry = createRegistry()
    const renderer = await mount(registry)
    useSimulationStore.getState().togglePaused()
    await renderer.advanceFrames(5, 1)
    const mars = registry.getOrbit('mars')!
    const initial = orbitalPosition(mars.orbit, 0)
    expect(mars.mover.position.x).toBeCloseTo(initial.x, 4)
    expect(registry.getBody('mars')!.mesh.rotation.y).toBe(0)
    await renderer.unmount()
  })
})
