import { Vector3 } from 'three'
import { describe, expect, it } from 'vitest'
import { cameraConfig, cameraFocusConfig, tacticalViewConfig } from '@/config/scene'
import { focusPlacement, homePlacement, tacticalPlacement } from '@/scene/camera/cameraDirector'

describe('focusPlacement', () => {
  const fov = cameraConfig.fov

  it('targets the body and places the camera on the Sun side of it', () => {
    const target = new Vector3(300, 0, 400)
    const { position, target: lookAt } = focusPlacement(target, 1.37, fov)
    expect(lookAt.equals(target)).toBe(true)
    // * La camera est entre le Soleil (origine) et le corps : plus proche de l'origine
    expect(position.length()).toBeLessThan(target.length())
    // * ... et alignee sur la direction Soleil → corps dans le plan horizontal
    const toBody = target.clone().normalize()
    const toCamera = new Vector3(position.x, 0, position.z).normalize()
    expect(toCamera.dot(toBody)).toBeCloseTo(1, 6)
  })

  it('keeps a distance proportional to the radius, with the focal multiplier and vertical offset', () => {
    const target = new Vector3(0, 0, 500)
    const radius = 2
    const { position } = focusPlacement(target, radius, fov)
    const fit = radius / Math.tan((fov * Math.PI) / 360)
    const distance = fit * cameraFocusConfig.focalLengthMultiplier
    expect(target.z - position.z).toBeCloseTo(distance, 6)
    expect(position.y).toBeCloseTo(distance * cameraFocusConfig.verticalOffsetRatio, 6)
  })

  it('never gets closer than the minimum focus distance', () => {
    const { position, target } = focusPlacement(new Vector3(0, 0, 100), 0.0001, fov)
    expect(position.distanceTo(target)).toBeGreaterThanOrEqual(cameraFocusConfig.minFocusDistance)
  })

  it('falls back to a fixed direction for a body at the origin (the Sun)', () => {
    const { position } = focusPlacement(new Vector3(0, 0, 0), 75, fov)
    expect(position.z).toBeLessThan(0)
    expect(position.y).toBeGreaterThan(0)
    expect(Number.isFinite(position.x)).toBe(true)
  })
})

describe('tacticalPlacement and homePlacement', () => {
  it('looks straight down at the origin from the configured height', () => {
    const { position, target } = tacticalPlacement()
    expect(position.y).toBe(tacticalViewConfig.height)
    expect(target.length()).toBe(0)
  })

  it('returns the initial camera position looking at the origin', () => {
    const { position, target } = homePlacement()
    expect(position.toArray()).toEqual([...cameraConfig.initialPosition])
    expect(target.length()).toBe(0)
  })
})
