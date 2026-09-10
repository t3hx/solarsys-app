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

/** Direction de repli pour cadrer le Soleil quand la camera est a sa verticale : devant (+Z). */
const FALLBACK_SUN_DIRECTION = new Vector3(0, 0, -1)

/**
 * ~ Cadre un corps : distance proportionnelle a son rayon (rayon / tan(fov/2) × 1.5,
 * plancher `minFocusDistance`), camera placee entre le Soleil et le corps, avec un leger
 * decalage vertical pour un meilleur angle de vue.
 * Pour un corps a l'origine (le Soleil), la camera reste du cote ou elle se trouve deja
 * (`from`) : la course ne traverse jamais le Soleil.
 */
export function focusPlacement(
  target: Vector3,
  radius: number,
  fovDegrees: number,
  from?: Vector3,
): CameraPlacement {
  const fit = radius / Math.tan(degToRad(fovDegrees) / 2)
  // * Jamais sous la distance minimale de suivi : sinon la camera est placee dans les
  // * petits corps (Ceres) et n'en ressort qu'au premier zoom
  const distance = Math.max(
    fit * cameraFocusConfig.focalLengthMultiplier,
    cameraFocusConfig.minFocusDistance,
    followMinDistance(radius),
  )

  const sunToBody = target.clone().normalize()
  if (sunToBody.lengthSq() < 0.001) {
    // * Le Soleil : on vise depuis le cote horizontal de la camera de depart
    const side = from ? new Vector3(from.x, 0, from.z) : new Vector3()
    sunToBody.copy(side.lengthSq() < 0.001 ? FALLBACK_SUN_DIRECTION : side.normalize().negate())
  }

  const position = target.clone().sub(sunToBody.multiplyScalar(distance))
  position.y += distance * cameraFocusConfig.verticalOffsetRatio

  return { position, target: target.clone() }
}

/** Marge au-dessus de la surface du corps suivi : facteur du rayon, plus deux fois le plan proche */
const SURFACE_CLEARANCE = 1.1
const NEAR_PLANE_MARGIN = cameraConfig.near * 2

/** ~ Distance minimale camera-cible en suivi : la camera reste hors du corps et de son plan de coupe. */
export function followMinDistance(radius: number): number {
  return radius * SURFACE_CLEARANCE + NEAR_PLANE_MARGIN
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
