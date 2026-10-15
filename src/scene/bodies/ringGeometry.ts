/**
 * @module scene/bodies/ringGeometry
 * @description Anneau plat dans le plan XZ, rayons exprimes en multiples du rayon du corps
 * (l'anneau est enfant du mesh du corps, deja mis a l'echelle). Les UV sont remappees
 * radialement : U = distance normalisee du bord interieur (0) au bord exterieur (1), V = 0.5,
 * pour projeter une texture en bande 1D horizontale (ex : anneaux de Saturne).
 */
import { RingGeometry } from 'three'

export function createRingGeometry(
  innerRadius: number,
  outerRadius: number,
  thetaSegments: number,
): RingGeometry {
  const geometry = new RingGeometry(innerRadius, outerRadius, thetaSegments)
  const position = geometry.getAttribute('position')
  const uv = geometry.getAttribute('uv')
  for (let i = 0; i < position.count; i++) {
    const radius = Math.hypot(position.getX(i), position.getY(i))
    uv.setXY(i, (radius - innerRadius) / (outerRadius - innerRadius), 0.5)
  }
  uv.needsUpdate = true
  // * Du plan XY (RingGeometry) vers le plan XZ (anneau horizontal)
  geometry.rotateX(-Math.PI / 2)
  return geometry
}
