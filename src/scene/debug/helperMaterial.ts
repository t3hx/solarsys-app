/**
 * @module scene/debug/helperMaterial
 * @description Rend un helper (axes, grille) visible a travers les objets.
 */
import type { AxesHelper, GridHelper } from 'three'

export function disableDepthTest(helper: AxesHelper | GridHelper) {
  const material = helper.material
  if (!Array.isArray(material)) {
    material.depthTest = false
    material.needsUpdate = true
  }
}
