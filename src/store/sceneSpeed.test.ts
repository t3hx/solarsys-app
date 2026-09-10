import { beforeEach, describe, expect, it } from 'vitest'
import { useInteractionStore } from '@/store/interaction'
import { bindSceneSpeedDefaults, defaultSpeedFor, sceneKindOf } from '@/store/sceneSpeed'
import { timeScalePresets, useSimulationStore } from '@/store/simulation'

const speedOf = (id: 'hour' | 'day' | 'year') =>
  timeScalePresets.find((preset) => preset.id === id)!.daysPerSecond

describe('sceneKindOf', () => {
  it('is tactical whenever the tactical view is on, focus with a selection, universe otherwise', () => {
    expect(sceneKindOf({ selectedId: null, isTactical: false })).toBe('universe')
    expect(sceneKindOf({ selectedId: 'earth', isTactical: false })).toBe('focus')
    expect(sceneKindOf({ selectedId: 'earth', isTactical: true })).toBe('tactical')
    expect(sceneKindOf({ selectedId: null, isTactical: true })).toBe('tactical')
  })
})

describe('defaultSpeedFor', () => {
  it('is slow in focus, one day per second in the universe, one year per second in tactical', () => {
    expect(defaultSpeedFor('focus')).toBe(speedOf('hour'))
    expect(defaultSpeedFor('universe')).toBe(speedOf('day'))
    expect(defaultSpeedFor('tactical')).toBe(speedOf('year'))
  })
})

describe('bindSceneSpeedDefaults', () => {
  beforeEach(() => {
    useInteractionStore.getState().reset()
    useSimulationStore.getState().reset()
  })

  it('applies the default speed of each scene when the scene changes', () => {
    const unbind = bindSceneSpeedDefaults()
    useInteractionStore.getState().select('earth')
    expect(useSimulationStore.getState().speed).toBe(speedOf('hour'))
    useInteractionStore.getState().toggleTactical()
    expect(useSimulationStore.getState().speed).toBe(speedOf('year'))
    useInteractionStore.getState().toggleTactical()
    expect(useSimulationStore.getState().speed).toBe(speedOf('hour'))
    useInteractionStore.getState().select(null)
    expect(useSimulationStore.getState().speed).toBe(speedOf('day'))
    unbind()
  })

  it('keeps a speed chosen by the user until the next scene change', () => {
    const unbind = bindSceneSpeedDefaults()
    useInteractionStore.getState().select('earth')
    useSimulationStore.getState().setSpeed(speedOf('year'))
    useInteractionStore.getState().hover('mars')
    useInteractionStore.getState().setInfoOpen(true)
    expect(useSimulationStore.getState().speed).toBe(speedOf('year'))
    useInteractionStore.getState().select('mars')
    expect(useSimulationStore.getState().speed).toBe(speedOf('hour'))
    unbind()
  })

  it('stops applying defaults once unbound', () => {
    const unbind = bindSceneSpeedDefaults()
    unbind()
    useInteractionStore.getState().select('earth')
    expect(useSimulationStore.getState().speed).toBe(speedOf('day'))
  })
})
