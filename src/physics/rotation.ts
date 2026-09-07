/**
 * @module physics/rotation
 * @description Periode de rotation → vitesse angulaire, en radians par jour simule.
 * Une periode negative (Venus, Uranus, Pluton) donne une vitesse negative : rotation retrograde.
 */
import { HOURS_PER_DAY } from '@/physics/units'

/** rad/jour pour une periode de 1 h ; divise par la periode en heures. */
const BASE_ANGULAR_SPEED = 2 * Math.PI * HOURS_PER_DAY

export function angularSpeedFromPeriodHours(periodHours: number): number {
  if (!Number.isFinite(periodHours) || periodHours === 0) return 0
  return BASE_ANGULAR_SPEED / periodHours
}
