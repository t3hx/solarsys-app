/**
 * @module scene/bodies/geometry
 * @description Sphere unitaire partagee par tous les corps et leurs couches (audit P5) :
 * le rayon est applique en `scale` sur chaque mesh, l'aplatissement en scale Y.
 * Jamais disposee : une seule instance pour toute la vie de l'application.
 */
import { SphereGeometry } from 'three'
import { sphereSegments } from '@/config/rendering'

let shared: SphereGeometry | null = null

export function unitSphereGeometry(): SphereGeometry {
  if (!shared) {
    shared = new SphereGeometry(1, sphereSegments, sphereSegments)
    shared.computeBoundingSphere()
  }
  return shared
}
