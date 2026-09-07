import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  hasSeenTutorial,
  TUTORIAL_STORAGE_KEY,
  tutorialSteps,
  useTutorial,
} from '@/onboarding/useTutorial'

describe('tutorial steps', () => {
  it('defines nine steps with spotlight targets that exist in the HUD', () => {
    expect(tutorialSteps).toHaveLength(9)
    const targets = tutorialSteps.map((step) => step.target).filter(Boolean)
    expect(targets).toEqual(['menu', 'zoom', 'time', 'lang', 'tactical'])
  })
})

describe('useTutorial', () => {
  beforeEach(() => localStorage.clear())

  it('starts on the first step', () => {
    const { result } = renderHook(() => useTutorial())
    expect(result.current.index).toBe(0)
    expect(result.current.isFirst).toBe(true)
    expect(result.current.isLast).toBe(false)
    expect(result.current.step.titleKey).toBe('tutorial.steps.welcome.title')
  })

  it('navigates forward, backward and directly, within bounds', () => {
    const { result } = renderHook(() => useTutorial())
    act(() => result.current.previous())
    expect(result.current.index).toBe(0)
    act(() => result.current.next())
    expect(result.current.index).toBe(1)
    act(() => result.current.goTo(8))
    expect(result.current.isLast).toBe(true)
    act(() => result.current.next())
    expect(result.current.index).toBe(8)
  })

  it('persists dismissal in localStorage', () => {
    expect(hasSeenTutorial()).toBe(false)
    const { result } = renderHook(() => useTutorial())
    act(() => result.current.dismiss())
    expect(localStorage.getItem(TUTORIAL_STORAGE_KEY)).toBe('1')
    expect(hasSeenTutorial()).toBe(true)
  })
})
