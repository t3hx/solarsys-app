import { beforeEach, describe, expect, it } from 'vitest'
import { timeScalePresets, useSimulationStore } from '@/store/simulation'

describe('simulation store', () => {
  beforeEach(() => {
    useSimulationStore.getState().reset()
  })

  it('starts at one simulated day per second, not paused', () => {
    expect(useSimulationStore.getState().speed).toBe(1)
    expect(useSimulationStore.getState().paused).toBe(false)
  })

  it('exposes three presets in human units: one hour, one day, one year per second', () => {
    expect(timeScalePresets.map((preset) => preset.id)).toEqual(['hour', 'day', 'year'])
    expect(timeScalePresets.map((preset) => preset.daysPerSecond)).toEqual([1 / 24, 1, 365.25])
  })

  it('accepts a strictly positive speed', () => {
    useSimulationStore.getState().setSpeed(10)
    expect(useSimulationStore.getState().speed).toBe(10)
  })

  it('ignores a zero, negative or non-finite speed', () => {
    const { setSpeed } = useSimulationStore.getState()
    setSpeed(0)
    setSpeed(-5)
    setSpeed(Number.NaN)
    expect(useSimulationStore.getState().speed).toBe(1)
  })

  it('toggles pause', () => {
    useSimulationStore.getState().togglePaused()
    expect(useSimulationStore.getState().paused).toBe(true)
    useSimulationStore.getState().togglePaused()
    expect(useSimulationStore.getState().paused).toBe(false)
  })
})
