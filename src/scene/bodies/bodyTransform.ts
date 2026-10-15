/**
 * @module scene/bodies/bodyTransform
 * @description Transformations communes des corps : inclinaison axiale et aplatissement.
 * L'ordre d'Euler ZYX fait tourner le corps (Y, anime par la simulation) autour de son
 * axe incline (Z). Les enfants du mesh (couches, anneaux) heritent de l'inclinaison.
 */
import type { Body } from '@/data/model'

export type EulerTuple = [number, number, number, 'ZYX']

export function axialTiltRotation(body: Body): EulerTuple {
  return [0, 0, body.axialTilt, 'ZYX']
}

/** ~ Echelle du mesh : rayon en unites de scene, aplatissement polaire sur Y (sphere unitaire partagee). */
export function bodyScale(body: Body, radiusUnits: number): [number, number, number] {
  const flattening = body.oblateness > 0 ? 1 - body.oblateness : 1
  return [radiusUnits, radiusUnits * flattening, radiusUnits]
}

export function bodyUserData(body: Body) {
  return { id: body.id, type: 'celestial-body' as const }
}
