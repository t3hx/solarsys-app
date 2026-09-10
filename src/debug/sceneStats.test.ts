import { Mesh, MeshStandardMaterial, Scene, Texture } from 'three'
import { describe, expect, it } from 'vitest'
import { textureStats } from '@/debug/sceneStats'

function textureOf(width: number, height: number): Texture {
  const texture = new Texture()
  texture.image = { width, height }
  return texture
}

describe('textureStats', () => {
  it('counts unique textures across materials and estimates their GPU footprint', () => {
    const scene = new Scene()
    const shared = textureOf(2048, 1024)
    const earth = new Mesh(
      undefined,
      new MeshStandardMaterial({ map: shared, normalMap: textureOf(8192, 4096) }),
    )
    const mars = new Mesh(undefined, new MeshStandardMaterial({ map: shared }))
    scene.add(earth, mars)
    const stats = textureStats(scene)
    expect(stats.count).toBe(2)
    // * (2048×1024 + 8192×4096) × 4 octets × 4/3 ≈ 181 Mo
    expect(stats.estimatedMegabytes).toBe(181)
  })

  it('ignores textures without a loaded image', () => {
    const scene = new Scene()
    scene.add(new Mesh(undefined, new MeshStandardMaterial({ map: new Texture() })))
    expect(textureStats(scene)).toEqual({ count: 1, estimatedMegabytes: 0 })
  })
})
