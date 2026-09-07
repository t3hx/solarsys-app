import type * as Drei from '@react-three/drei'
import ReactThreeTestRenderer from '@react-three/test-renderer'
import { Texture, Vector3 } from 'three'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cameraConfig, cameraFocusConfig, tacticalViewConfig } from '@/config/scene'
import { CameraRig } from '@/scene/camera/CameraRig'
import { createRegistry, RegistryProvider } from '@/scene/registry'
import { SimulationDriver } from '@/scene/simulation/SimulationDriver'
import { SolarSystem } from '@/scene/SolarSystem'
import { useCameraStore } from '@/store/camera'
import { useInteractionStore } from '@/store/interaction'
import { useSimulationStore } from '@/store/simulation'
import { solarSystemFixture } from '@/test/fixtures/solarSystem'

// ~ Faux CameraControls : memorise position et cible, enregistre les appels
const fake = vi.hoisted(() => {
  const state = {
    position: [0, 75, 1000] as [number, number, number],
    target: [0, 0, 0] as [number, number, number],
    distance: 1003,
  }
  const controls = {
    setLookAt: vi.fn(
      (px: number, py: number, pz: number, tx: number, ty: number, tz: number, _t?: boolean) => {
        state.position = [px, py, pz]
        state.target = [tx, ty, tz]
        return Promise.resolve()
      },
    ),
    moveTo: vi.fn<(x: number, y: number, z: number, transition?: boolean) => Promise<void>>(() =>
      Promise.resolve(),
    ),
    getPosition: vi.fn((out: { set: (x: number, y: number, z: number) => unknown }) =>
      out.set(...state.position),
    ),
    getTarget: vi.fn((out: { set: (x: number, y: number, z: number) => unknown }) =>
      out.set(...state.target),
    ),
    get distance() {
      return state.distance
    },
  }
  return { state, controls }
})

// ~ GSAP synchrone : chaque tween saute a la fin et enregistre sa duree
const tweens = vi.hoisted(() => ({ durations: [] as number[] }))
vi.mock('gsap', () => ({
  gsap: {
    to: (
      target: { progress: number },
      vars: { duration: number; onUpdate?: () => void; onComplete?: () => void },
    ) => {
      tweens.durations.push(vars.duration)
      target.progress = 1
      vars.onUpdate?.()
      vars.onComplete?.()
      return { kill: () => undefined }
    },
  },
}))

vi.mock('@react-three/drei', async (importOriginal) => {
  const actual = await importOriginal<typeof Drei>()
  const React = await import('react')
  const CameraControls = React.forwardRef(function FakeCameraControls(
    _props: unknown,
    ref: React.ForwardedRef<unknown>,
  ) {
    React.useImperativeHandle(ref, () => fake.controls)
    return null
  })
  const useTexture = Object.assign(() => new Texture(), { preload: () => undefined })
  return { ...actual, CameraControls, useTexture }
})

const interaction = () => useInteractionStore.getState()
const act = (fn: () => void) => ReactThreeTestRenderer.act(async () => fn())

function mount(registry = createRegistry()) {
  return ReactThreeTestRenderer.create(
    <RegistryProvider registry={registry}>
      <SolarSystem system={solarSystemFixture} />
      <SimulationDriver />
      <CameraRig />
    </RegistryProvider>,
  )
}

describe('CameraRig', () => {
  beforeEach(() => {
    interaction().reset()
    useSimulationStore.getState().reset()
    useCameraStore.getState().reset()
    fake.controls.setLookAt.mockClear()
    fake.controls.moveTo.mockClear()
    fake.state.position = [0, 75, 1000]
    fake.state.target = [0, 0, 0]
    fake.state.distance = 1003
    tweens.durations.length = 0
  })

  it('does not move the camera on mount', async () => {
    const renderer = await mount()
    expect(fake.controls.setLookAt).not.toHaveBeenCalled()
    await renderer.unmount()
  })

  it('focuses on the selected body between the Sun and the body in 1.5 s, then follows', async () => {
    const registry = createRegistry()
    const renderer = await mount(registry)
    await act(() => interaction().select('earth'))

    expect(tweens.durations).toEqual([cameraFocusConfig.focusDuration])
    const [px, , pz, tx, ty, tz] = fake.controls.setLookAt.mock.calls.at(-1)!
    const earthPosition = registry.getBody('earth')!.mesh.getWorldPosition(new Vector3())
    expect([tx, ty, tz]).toEqual(earthPosition.toArray())
    expect(Math.hypot(px, pz)).toBeLessThan(Math.hypot(earthPosition.x, earthPosition.z))
    expect(interaction().isFollowing).toBe(true)
    await renderer.unmount()
  })

  it('keeps the target on the followed body every frame', async () => {
    const registry = createRegistry()
    const renderer = await mount(registry)
    await act(() => interaction().select('mars'))
    useSimulationStore.getState().setSpeed(10)
    await renderer.advanceFrames(2, 1)

    const mars = registry.getBody('mars')!.mesh.getWorldPosition(new Vector3())
    const lastCall = fake.controls.moveTo.mock.calls.at(-1)!
    expect(lastCall.slice(0, 3)).toEqual(mars.toArray())
    expect(lastCall[3]).toBe(false)
    await renderer.unmount()
  })

  it('returns home in 1.5 s when the selection is cleared', async () => {
    const renderer = await mount()
    await act(() => interaction().select('venus'))
    await act(() => interaction().select(null))

    expect(tweens.durations.at(-1)).toBe(cameraFocusConfig.resetDuration)
    const lastCall = fake.controls.setLookAt.mock.calls.at(-1)!
    expect(lastCall.slice(0, 3)).toEqual([...cameraConfig.initialPosition])
    expect(lastCall.slice(3, 6)).toEqual([0, 0, 0])
    expect(interaction().isFollowing).toBe(false)
    await renderer.unmount()
  })

  it('enters the tactical view from above in 2 s and restores the previous state on exit', async () => {
    const renderer = await mount()
    fake.state.position = [120, 30, 400]
    fake.state.target = [100, 0, 380]
    await act(() => interaction().toggleTactical())

    expect(tweens.durations.at(-1)).toBe(tacticalViewConfig.transitionDuration)
    const enter = fake.controls.setLookAt.mock.calls.at(-1)!
    expect(enter.slice(0, 6)).toEqual([0, tacticalViewConfig.height, 0, 0, 0, 0])
    expect(interaction().isTactical).toBe(true)

    await act(() => interaction().toggleTactical())
    const exit = fake.controls.setLookAt.mock.calls.at(-1)!
    expect(exit.slice(0, 6)).toEqual([120, 30, 400, 100, 0, 380])
    expect(interaction().isTactical).toBe(false)
    await renderer.unmount()
  })

  it('resumes following after leaving the tactical view if a body was selected', async () => {
    const renderer = await mount()
    await act(() => interaction().select('jupiter'))
    expect(interaction().isFollowing).toBe(true)

    await act(() => interaction().toggleTactical())
    expect(interaction().isFollowing).toBe(false)
    await act(() => interaction().toggleTactical())
    expect(interaction().isFollowing).toBe(true)
    await renderer.unmount()
  })

  it('publishes the zoom level from the camera distance every frame', async () => {
    const renderer = await mount()
    fake.state.distance = 100
    await renderer.advanceFrames(1, 0.016)
    expect(useCameraStore.getState().zoomLevel).toBe(10)
    fake.state.distance = 30_000
    await renderer.advanceFrames(1, 0.016)
    expect(useCameraStore.getState().zoomMode).toBe('outOfRange')
    await renderer.unmount()
  })
})
