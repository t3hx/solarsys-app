/**
 * @module data/normalize
 * @description Transforme le JSON valide (chaines + unites) en modele numerique normalise.
 * Une seule conversion, a un seul endroit : la scene ne fait plus jamais de parseFloat.
 */
import type { Body, BodyKind, BodyTextures, Orbit, Rings, SolarSystem } from '@/data/model'
import type { RawPhysicalProps, RawPlanet, RawSolarSystem, RawTextures } from '@/data/schema'
import { degToRad, parseTimeUnit, toDays, toHours } from '@/physics/units'

function toNumber(raw: string | undefined): number | undefined {
  if (raw === undefined) return undefined
  const value = Number.parseFloat(raw)
  return Number.isNaN(value) ? undefined : value
}

function requireNumber(raw: string, field: string, bodyId: string): number {
  const value = toNumber(raw)
  if (value === undefined)
    throw new Error(`Body "${bodyId}": "${field}" is not a number ("${raw}")`)
  return value
}

function normalizeTextures(raw: RawTextures): BodyTextures {
  const textures: BodyTextures = { main: raw.main }
  const optionalKeys = [
    'day',
    'night',
    'clouds',
    'rings',
    'atmosphere',
    'specular',
    'normal',
    'bump',
  ] as const
  for (const key of optionalKeys) {
    const path = raw[key]
    if (path) textures[key] = path
  }
  return textures
}

function normalizeRings(
  raw: RawPhysicalProps['rings'],
  texture: string | undefined,
): Rings | undefined {
  if (!('innerRadius' in raw)) return undefined
  const innerRadiusKm = toNumber(raw.innerRadius)
  const outerRadiusKm = toNumber(raw.outerRadius)
  if (innerRadiusKm === undefined || outerRadiusKm === undefined) return undefined
  const rings: Rings = { innerRadiusKm, outerRadiusKm }
  if (texture) rings.texture = texture
  return rings
}

function normalizeOrbit(raw: RawPlanet['orbitalProps'], bodyId: string): Orbit | undefined {
  // * Le Soleil a des elements orbitaux vides : pas d'orbite
  if (raw.semiMajorAxis.trim() === '') return undefined
  const periodUnit = parseTimeUnit(raw.orbitalPeriodUnit, 'days')
  return {
    semiMajorAxisKm: requireNumber(raw.semiMajorAxis, 'semiMajorAxis', bodyId),
    eccentricity: toNumber(raw.orbitalEccentricity) ?? 0,
    inclination: degToRad(toNumber(raw.orbitalInclination) ?? 0),
    longAscendingNode: degToRad(toNumber(raw.longAscendingNode) ?? 0),
    argOfPerihelion: degToRad(toNumber(raw.argOfPerihelion) ?? 0),
    meanAnomalyAtEpoch: degToRad(toNumber(raw.meanAnomaly) ?? 0),
    periodDays: toDays(requireNumber(raw.orbitalPeriod, 'orbitalPeriod', bodyId), periodUnit),
  }
}

function normalizeTemperature(raw: RawPhysicalProps): Body['temperature'] {
  const minC = toNumber(raw.surfaceMinTemperature)
  const meanC = toNumber(raw.surfaceMeanTemperature)
  const maxC = toNumber(raw.surfaceMaxTemperature)
  if (minC === undefined && meanC === undefined && maxC === undefined) return undefined
  const temperature: NonNullable<Body['temperature']> = {}
  if (minC !== undefined) temperature.minC = minC
  if (meanC !== undefined) temperature.meanC = meanC
  if (maxC !== undefined) temperature.maxC = maxC
  return temperature
}

function normalizeBody(raw: RawPlanet, kind: BodyKind, parentId?: string): Body {
  const physical = raw.physicalProps
  const id = raw.id
  const rotationUnit = parseTimeUnit(physical.rotationPeriodUnit, 'hours')
  const dayUnit = parseTimeUnit(physical.lengthOfDayUnit, 'hours')

  const body: Body = {
    id,
    name: raw.name,
    kind,
    description: raw.description,
    textures: normalizeTextures(raw.textures),
    radiusKm: requireNumber(physical.meanRadius, 'meanRadius', id),
    oblateness: toNumber(physical.oblateness) ?? 0,
    axialTilt: degToRad(toNumber(physical.axialTilt) ?? 0),
    rotationPeriodHours: toHours(
      requireNumber(physical.rotationPeriod, 'rotationPeriod', id),
      rotationUnit,
    ),
    massKg: requireNumber(physical.mass, 'mass', id),
    densityKgM3: requireNumber(physical.density, 'density', id),
    surfaceGravityG: requireNumber(physical.surfaceGravity, 'surfaceGravity', id),
    satellites: [],
  }

  const lengthOfDay = toNumber(physical.lengthOfDay)
  if (lengthOfDay !== undefined) body.lengthOfDayHours = toHours(lengthOfDay, dayUnit)
  const escapeVelocity = toNumber(physical.escapeVelocity)
  if (escapeVelocity !== undefined) body.escapeVelocityKmS = escapeVelocity
  const temperature = normalizeTemperature(physical)
  if (temperature) body.temperature = temperature
  const rings = normalizeRings(physical.rings, body.textures.rings)
  if (rings) body.rings = rings
  const orbit = normalizeOrbit(raw.orbitalProps, id)
  if (orbit) body.orbit = orbit
  if (parentId !== undefined) body.parentId = parentId
  if (raw.rank !== undefined) body.rank = raw.rank
  if (raw.numberOfMoons !== undefined) body.knownMoons = raw.numberOfMoons
  if (raw.rotationDirection !== undefined) body.rotationDirection = raw.rotationDirection

  if (raw.satellites) {
    body.satellites = Object.values(raw.satellites).map((satellite) =>
      normalizeBody(satellite, 'satellite', id),
    )
  }
  return body
}

export function normalizeSolarSystem(raw: RawSolarSystem): SolarSystem {
  const sun = normalizeBody(raw.sun, 'star')
  const planets = Object.values(raw.planets).map((planet) =>
    normalizeBody(planet, 'planet', sun.id),
  )

  const byId = new Map<string, Body>()
  const register = (body: Body) => {
    if (byId.has(body.id)) throw new Error(`Duplicate body id "${body.id}"`)
    byId.set(body.id, body)
    body.satellites.forEach(register)
  }
  register(sun)
  planets.forEach(register)

  return { sun, planets, byId }
}
