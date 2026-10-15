import { describe, expect, it } from 'vitest'
import { injectDayNightShader } from '@/scene/bodies/dayNightShader'

function shaderStub() {
  return {
    uniforms: {} as Record<string, { value: unknown }>,
    vertexShader: 'void main() {\n#include <worldpos_vertex>\n}',
    fragmentShader: 'void main() {\n#include <emissivemap_fragment>\n}',
  }
}

describe('injectDayNightShader', () => {
  it('adds the light position uniform at the origin', () => {
    const shader = injectDayNightShader(shaderStub())
    const value = shader.uniforms.uLightPosition?.value as { x: number; y: number; z: number }
    expect(value).toMatchObject({ x: 0, y: 0, z: 0 })
  })

  it('passes world position and normal from the vertex to the fragment shader', () => {
    const shader = injectDayNightShader(shaderStub())
    expect(shader.vertexShader).toMatch(/varying vec3 vWorldPosition/)
    expect(shader.vertexShader).toMatch(/varying vec3 vWorldNormal/)
    expect(shader.vertexShader).toMatch(
      /#include <worldpos_vertex>[\s\S]*vWorldPosition = \(modelMatrix \* vec4\(transformed, 1\.0\)\)\.xyz/,
    )
    expect(shader.fragmentShader).toMatch(/uniform vec3 uLightPosition/)
  })

  it('multiplies the emissive radiance by the night factor after the emissive map include', () => {
    const shader = injectDayNightShader(shaderStub())
    expect(shader.fragmentShader).toMatch(
      /#include <emissivemap_fragment>[\s\S]*totalEmissiveRadiance \*= nightFactor/,
    )
    expect(shader.fragmentShader).toMatch(/smoothstep\(0\.0, 0\.15, lightDot\)/)
  })

  it('keeps the original includes so Three still injects its own code', () => {
    const shader = injectDayNightShader(shaderStub())
    expect(shader.vertexShader).toContain('#include <worldpos_vertex>')
    expect(shader.fragmentShader).toContain('#include <emissivemap_fragment>')
  })
})
