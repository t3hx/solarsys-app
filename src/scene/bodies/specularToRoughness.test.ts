import { describe, expect, it } from 'vitest'
import { specularProcessing } from '@/config/rendering'
import { specularToRoughness } from '@/scene/bodies/specularToRoughness'

function pixels(...rgba: number[][]): Uint8ClampedArray {
  return new Uint8ClampedArray(rgba.flat())
}

describe('specularToRoughness', () => {
  it('inverts the green channel: shiny (255) becomes the minimum roughness, dull (0) stays rough', () => {
    const data = pixels([0, 255, 0, 255], [0, 0, 0, 255])
    specularToRoughness(data)
    expect([data[0], data[1], data[2]]).toEqual([128, 128, 128])
    expect([data[4], data[5], data[6]]).toEqual([255, 255, 255])
  })

  it('clamps the roughness to the configured minimum', () => {
    const data = pixels([0, 200, 0, 255])
    specularToRoughness(data)
    expect(data[1]).toBe(specularProcessing.minRoughness)
  })

  it('writes the same value on the three color channels and keeps alpha', () => {
    const data = pixels([10, 100, 30, 42])
    specularToRoughness(data)
    expect(data[0]).toBe(data[1])
    expect(data[2]).toBe(data[1])
    expect(data[1]).toBe(155)
    expect(data[3]).toBe(42)
  })

  it('returns the same buffer, mutated in place', () => {
    const data = pixels([0, 0, 0, 255])
    expect(specularToRoughness(data)).toBe(data)
  })
})
