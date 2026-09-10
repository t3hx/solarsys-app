import { Mesh, MeshStandardMaterial, Scene, Texture } from 'three'
import { describe, expect, it, vi } from 'vitest'
import { uploadSceneTextures } from '@/scene/uploadSceneTextures'

describe('uploadSceneTextures', () => {
  it('uploads every distinct texture of the scene once', () => {
    const scene = new Scene()
    const shared = new Texture()
    const normal = new Texture()
    scene.add(
      new Mesh(undefined, new MeshStandardMaterial({ map: shared, normalMap: normal })),
      new Mesh(undefined, new MeshStandardMaterial({ map: shared })),
    )
    const gl = { initTexture: vi.fn() }
    expect(uploadSceneTextures(gl, scene)).toBe(2)
    expect(gl.initTexture).toHaveBeenCalledTimes(2)
    expect(gl.initTexture).toHaveBeenCalledWith(shared)
    expect(gl.initTexture).toHaveBeenCalledWith(normal)
  })
})
