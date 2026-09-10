import { describe, expect, it } from 'vitest'
import { composeShaderInjections } from '@/scene/bodies/shaderInjections'

describe('composeShaderInjections', () => {
  const upper = {
    name: 'upper',
    apply: (s: { fragmentShader: string }) => ({
      ...s,
      fragmentShader: s.fragmentShader.toUpperCase(),
    }),
  }
  const suffix = {
    name: 'suffix',
    apply: (s: { fragmentShader: string }) => ({ ...s, fragmentShader: `${s.fragmentShader}!` }),
  }

  it('applies the injections in order and names the program cache key after them', () => {
    const material = composeShaderInjections([upper, suffix])
    expect(material.customProgramCacheKey()).toBe('upper+suffix')
    expect(material.onBeforeCompile({ fragmentShader: 'abc' }).fragmentShader).toBe('ABC!')
  })

  it('yields no override when there is nothing to inject', () => {
    expect(composeShaderInjections([])).toEqual({})
  })
})
