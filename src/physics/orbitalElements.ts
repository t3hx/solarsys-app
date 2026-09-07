/**
 * @module physics/orbitalElements
 * @description Changement de plan de reference pour l'inclinaison et la longitude du
 * noeud ascendant (ex : ecliptique → plan equatorial du Soleil). Angles en radians.
 *
 * Derivation : la normale de l'orbite n = (sin i sin Ω, -sin i cos Ω, cos i) est exprimee
 * dans le nouveau repere, obtenu par rotation d'angle `tilt` autour de l'axe X (ligne des
 * noeuds du nouveau plan). On lit ensuite (i', Ω') sur la normale transformee.
 *
 * Note : la version Vue (utils/coordinateConversion.ts) avait le signe de la composante
 * `x` inverse, ce qui renvoyait Ω' = 180° - Ω pour un plan non incline (audit B14).
 */

export interface ReferencePlaneElements {
  /** Inclinaison de l'orbite par rapport au plan de reference, en radians */
  inclination: number
  /** Longitude du noeud ascendant par rapport au plan de reference, en radians */
  longAscendingNode: number
}

export function convertOrbitalElements(
  elements: ReferencePlaneElements,
  newPlaneInclination: number,
): ReferencePlaneElements {
  const { inclination: i, longAscendingNode: node } = elements
  const tilt = newPlaneInclination

  const cosNewInclination =
    Math.cos(i) * Math.cos(tilt) + Math.sin(i) * Math.sin(tilt) * Math.cos(node)
  // * Clamp contre les erreurs d'arrondi (|cos| peut depasser 1 de 1e-16)
  const newInclination = Math.acos(Math.min(1, Math.max(-1, cosNewInclination)))

  const y = Math.sin(i) * Math.sin(node)
  const x = Math.sin(i) * Math.cos(node) * Math.cos(tilt) - Math.cos(i) * Math.sin(tilt)
  const newLongAscendingNode = Math.atan2(y, x)

  return { inclination: newInclination, longAscendingNode: newLongAscendingNode }
}
