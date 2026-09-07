/**
 * @module scene/camera/cameraDirector
 * @description Calculs purs de placement camera (position + cible), sans dependance a
 * CameraControls : focus sur un corps, vue tactique, position initiale.
 */
import { Vector3 } from 'three'
import { cameraConfig, cameraFocusConfig, tacticalViewConfig } from '@/config/scene'
import { degToRad } from '@/physics/units'

export interface CameraPlacement {
  position: Vector3
  target: Vector3
}

/**
 * Direction Soleil → corps de repli pour un corps a l'origine (le Soleil lui-meme).
 * La camera est placee a l'oppose : devant le Soleil (+Z) et legerement au-dessus.
 */
const FALLBACK_DIRECTION = new Vector3(0, -0.3, 1).normalize()

/**
 * ~ Cadre un corps : distance proportionnelle a son rayon (rayon / tan(fov/2) × 1.5,
 * plancher `minFocusDistance`), camera placee entre le Soleil et le corps, avec un leger
 * decalage vertical pour un meilleur angle de vue.
 */
export function focusPlacement(
  target: Vector3,
  radius: number,
  fovDegrees: number,
): CameraPlacement {
  const fit = radius / Math.tan(degToRad(fovDegrees) / 2)
  const distance = Math.max(
    fit * cameraFocusConfig.focalLengthMultiplier,
    cameraFocusConfig.minFocusDistance,
  )

  const sunToBody = target.clone().normalize()
  if (sunToBody.lengthSq() < 0.001) sunToBody.copy(FALLBACK_DIRECTION)

  const position = target.clone().sub(sunToBody.multiplyScalar(distance))
  position.y += distance * cameraFocusConfig.verticalOffsetRatio

  return { position, target: target.clone() }
}

export function tacticalPlacement(): CameraPlacement {
  return {
    position: new Vector3(0, tacticalViewConfig.height, 0),
    target: new Vector3(0, 0, 0),
  }
}

export function homePlacement(): CameraPlacement {
  return {
    position: new Vector3(...cameraConfig.initialPosition),
    target: new Vector3(0, 0, 0),
  }
}
