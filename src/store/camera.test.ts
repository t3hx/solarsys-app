import { beforeEach, describe, expect, it } from 'vitest'
import { useCameraStore } from '@/store/camera'

describe('camera store', () => {
  beforeEach(() => useCameraStore.getState().reset())

  it('starts at the level and mode of the home camera distance', () => {
    // * Position initiale (0, 75, 1000) → distance ≈ 1003 u → niveau 6, mode normal
    expect(useCameraStore.getState().zoomLevel).toBe(6)
    expect(useCameraStore.getState().zoomMode).toBe('normal')
  })

  it('derives the discrete level and mode from a distance', () => {
    useCameraStore.getState().updateFromDistance(100)
    expect(useCameraStore.getState()).toMatchObject({ zoomLevel: 10, zoomMode: 'max' })
    useCameraStore.getState().updateFromDistance(30_000)
    expect(useCameraStore.getState()).toMatchObject({ zoomLevel: 0, zoomMode: 'outOfRange' })
    useCameraStore.getState().updateFromDistance(34_500)
    expect(useCameraStore.getState().zoomMode).toBe('void')
  })

  it('does not publish a new state when level and mode are unchanged', () => {
    let notifications = 0
    const unsubscribe = useCameraStore.subscribe(() => notifications++)
    useCameraStore.getState().updateFromDistance(1000)
    useCameraStore.getState().updateFromDistance(1001)
    useCameraStore.getState().updateFromDistance(1100)
    unsubscribe()
    expect(notifications).toBe(0)
  })
})
