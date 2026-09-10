import { beforeEach, describe, expect, it } from 'vitest'
import { useCameraStore } from '@/store/camera'

describe('camera store', () => {
  beforeEach(() => useCameraStore.getState().reset())

  it('starts at the level and mode of the home camera above the Sun surface', () => {
    // * Position initiale (0, 75, 1000) → distance ≈ 1003 u, minimum ≈ 83 u (surface du Soleil)
    expect(useCameraStore.getState().zoomLevel).toBe(6)
    expect(useCameraStore.getState().zoomMode).toBe('normal')
  })

  it('derives the level and mode from the distance and the minimum reachable distance', () => {
    useCameraStore.getState().updateFromDistance(1.7, 1.7)
    expect(useCameraStore.getState()).toMatchObject({ zoomLevel: 10, zoomMode: 'max' })
    useCameraStore.getState().updateFromDistance(30_000, 83)
    expect(useCameraStore.getState()).toMatchObject({ zoomLevel: 0, zoomMode: 'outOfRange' })
    useCameraStore.getState().updateFromDistance(50_000, 83)
    expect(useCameraStore.getState().zoomMode).toBe('void')
  })

  it('does not publish a new state when level and mode are unchanged', () => {
    let notifications = 0
    const unsubscribe = useCameraStore.subscribe(() => notifications++)
    useCameraStore.getState().updateFromDistance(1000, 83)
    useCameraStore.getState().updateFromDistance(1001, 83)
    useCameraStore.getState().updateFromDistance(1100, 83)
    unsubscribe()
    expect(notifications).toBe(0)
  })
})
