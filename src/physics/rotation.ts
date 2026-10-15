/**
 * @module physics/rotation
 * @description Periode de rotation → vitesse angulaire, en radians par jour simule.
 * La periode est positive : le corps tourne dans le sens direct autour de son propre pole, et
 * c'est l'obliquite (> 90° pour Venus, Uranus, Pluton) qui rend la rotation retrograde.
 */
import { HOURS_PER_DAY } from '@/physics/units'

/** rad/jour pour une periode de 1 h ; divise par la periode en heures. */
const BASE_ANGULAR_SPEED = 2 * Math.PI * HOURS_PER_DAY

export function angularSpeedFromPeriodHours(periodHours: number): number {
  if (!Number.isFinite(periodHours) || periodHours === 0) return 0
  return BASE_ANGULAR_SPEED / periodHours
}
