import ReactThreeTestRenderer from '@react-three/test-renderer'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SceneReadyMarker } from '@/scene/SceneReadyMarker'
import { useAppStore } from '@/store/app'

const upload = vi.hoisted(() => ({ calls: [] as string[] }))
vi.mock('@/scene/uploadSceneTextures', () => ({
  uploadSceneTextures: () => {
    upload.calls.push('upload')
    return 0
  },
}))

describe('SceneReadyMarker', () => {
  beforeEach(() => {
    useAppStore.getState().reset()
    upload.calls.length = 0
  })

  it('uploads the scene textures to the GPU before declaring the scene ready', async () => {
    const unsubscribe = useAppStore.subscribe((state, previous) => {
      if (state.sceneReady && !previous.sceneReady) upload.calls.push('ready')
    })
    const renderer = await ReactThreeTestRenderer.create(<SceneReadyMarker />)
    expect(upload.calls).toEqual(['upload', 'ready'])
    expect(useAppStore.getState().sceneReady).toBe(true)
    await renderer.unmount()
    expect(useAppStore.getState().sceneReady).toBe(false)
    unsubscribe()
  })
})
