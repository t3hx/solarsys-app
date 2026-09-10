import { Vector3 } from 'three'
import { describe, expect, it } from 'vitest'
import { cameraConfig, cameraFocusConfig, tacticalViewConfig } from '@/config/scene'
import {
  focusPlacement,
  followMinDistance,
  homePlacement,
  tacticalPlacement,
} from '@/scene/camera/cameraDirector'

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

  it('never frames a body closer than the follow minimum distance (Ceres, radius 0.1)', () => {
    const radius = 0.101
    const { position, target } = focusPlacement(new Vector3(0, 0, 840), radius, fov)
    expect(position.distanceTo(target)).toBeGreaterThanOrEqual(followMinDistance(radius))
  })

  it('frames a body at the origin (the Sun) from the side the camera already is on', () => {
    const from = new Vector3(-300, 40, -400)
    const { position, target } = focusPlacement(new Vector3(0, 0, 0), 75, fov, from)
    expect(target.length()).toBe(0)
    // * Meme cote que la camera de depart : la course ne traverse pas le Soleil
    const fromSide = new Vector3(from.x, 0, from.z).normalize()
    const toCamera = new Vector3(position.x, 0, position.z).normalize()
    expect(toCamera.dot(fromSide)).toBeCloseTo(1, 6)
    expect(position.y).toBeGreaterThan(0)
    expect(position.length()).toBeGreaterThan(75)
  })

  it('falls back to a fixed direction for the Sun when the camera is straight above it', () => {
    const { position } = focusPlacement(new Vector3(0, 0, 0), 75, fov, new Vector3(0, 28000, 0))
    expect(position.z).toBeGreaterThan(0)
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
