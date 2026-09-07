/**
 * @module data/model
 * @description Modele normalise du systeme solaire : nombres en unites SI, angles en
 * radians, textures optionnelles. C'est ce modele, et jamais le JSON brut, que la scene,
 * la simulation et les fenetres d'information consomment.
 */

import type { TimeUnit } from '@/physics/units'

export type BodyKind = 'star' | 'planet' | 'satellite'

/** Valeur telle que declaree dans les donnees, pour l'affichage (ex : 11.86 years) */
export interface DisplayDuration {
  value: number
  unit: TimeUnit
}

export interface BodyTextures {
  main: string
  day?: string
  night?: string
  clouds?: string
  rings?: string
  atmosphere?: string
  specular?: string
  normal?: string
  bump?: string
}

export interface Rings {
  innerRadiusKm: number
  outerRadiusKm: number
  texture?: string
}

export interface SurfaceTemperature {
  minC?: number
  meanC?: number
  maxC?: number
}

/** Elements orbitaux, en km / jours / radians, par rapport au plan de reference du JSON. */
export interface Orbit {
  semiMajorAxisKm: number
  eccentricity: number
  inclination: number
  longAscendingNode: number
  argOfPerihelion: number
  meanAnomalyAtEpoch: number
  periodDays: number
  periodDisplay: DisplayDuration
}

export interface Body {
  id: string
  name: string
  kind: BodyKind
  description: string
  textures: BodyTextures
  radiusKm: number
  oblateness: number
  /** Inclinaison axiale, en radians */
  axialTilt: number
  /** Periode de rotation en heures, negative si retrograde */
  rotationPeriodHours: number
  massKg: number
  densityKgM3: number
  surfaceGravityG: number
  lengthOfDayHours?: number
  lengthOfDayDisplay?: DisplayDuration
  escapeVelocityKmS?: number
  temperature?: SurfaceTemperature
  rings?: Rings
  /** Absent pour l'etoile centrale */
  orbit?: Orbit
  /** Id du corps autour duquel ce corps orbite (absent pour l'etoile) */
  parentId?: string
  rank?: number
  knownMoons?: number
  rotationDirection?: 'prograde' | 'retrograde'
  satellites: Body[]
}

export interface SolarSystem {
  sun: Body
  planets: Body[]
  byId: ReadonlyMap<string, Body>
}
