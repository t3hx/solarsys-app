import { describe, expect, it } from 'vitest'
import { injectSpecularRoughness } from '@/scene/bodies/specularRoughnessShader'

function shaderStub() {
  return {
    uniforms: {} as Record<string, { value: unknown }>,
    vertexShader: 'void main() {}',
    fragmentShader:
      'void main() {\n#include <roughnessmap_fragment>\n#include <emissivemap_fragment>\n}',
  }
}

describe('injectSpecularRoughness', () => {
  it('reads roughness as the inverse of the specular brightness, floored for water', () => {
    const shader = injectSpecularRoughness(shaderStub(), 0.6)
    expect(shader.uniforms.uMinRoughness?.value).toBe(0.6)
    expect(shader.fragmentShader).toMatch(/uniform float uMinRoughness/)
    expect(shader.fragmentShader).toMatch(
      /roughnessFactor \*= max\(1\.0 - texelRoughness\.g, uMinRoughness\)/,
    )
  })

  it('replaces the roughness map include so Three no longer reads the green channel as roughness', () => {
    const shader = injectSpecularRoughness(shaderStub(), 0.6)
    expect(shader.fragmentShader).not.toContain('#include <roughnessmap_fragment>')
    expect(shader.fragmentShader).toMatch(/texture2D\( roughnessMap, vRoughnessMapUv \)/)
    expect(shader.fragmentShader).toContain('#include <emissivemap_fragment>')
  })
})
