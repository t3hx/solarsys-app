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

export function oblatenessScale(body: Body): [number, number, number] {
  const flattening = body.oblateness > 0 ? 1 - body.oblateness : 1
  return [1, flattening, 1]
}

export function bodyUserData(body: Body) {
  return { id: body.id, type: 'celestial-body' as const }
}
