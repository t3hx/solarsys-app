import { beforeEach, describe, expect, it } from 'vitest'
import { useAppStore } from '@/store/app'

const store = () => useAppStore.getState()

describe('app store', () => {
  beforeEach(() => store().reset())

  it('starts in the preloading phase with the scene not ready', () => {
    expect(store().phase).toBe('preloading')
    expect(store().sceneReady).toBe(false)
  })

  it('records when the scene is ready', () => {
    store().setSceneReady(true)
    expect(store().sceneReady).toBe(true)
  })

  it('moves through the phases in order only', () => {
    store().finishPreloading({ tutorialSeen: false })
    expect(store().phase).toBe('tutorial')
    store().finishTutorial()
    expect(store().phase).toBe('scene')
  })

  it('skips the tutorial when it was already seen', () => {
    store().finishPreloading({ tutorialSeen: true })
    expect(store().phase).toBe('scene')
  })
})
