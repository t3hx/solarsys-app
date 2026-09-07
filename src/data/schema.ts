/**
 * @module data/schema
 * @description Schema zod du fichier `public/data/solar_system_data.json` tel qu'il est
 * (valeurs numeriques sous forme de chaines + champs d'unite). Aucune conversion ici :
 * c'est le role de `data/normalize`.
 */
import { z } from 'zod'

const numericString = z.string()
const optionalString = z.string().optional()

export const rawTexturesSchema = z.object({
  main: z.string(),
  day: optionalString,
  night: optionalString,
  clouds: optionalString,
  rings: optionalString,
  atmosphere: optionalString,
  specular: optionalString,
  normal: optionalString,
  bump: optionalString,
})

export const rawRingsSchema = z.object({
  innerRadius: numericString,
  innerRadiusUnit: optionalString,
  outerRadius: numericString,
  outerRadiusUnit: optionalString,
})

export const rawPhysicalPropsSchema = z.object({
  meanRadius: numericString,
  meanRadiusUnit: optionalString,
  oblateness: numericString,
  oblatenessUnit: optionalString,
  axialTilt: numericString,
  axialTiltUnit: optionalString,
  rotationPeriod: numericString,
  rotationPeriodUnit: optionalString,
  mass: numericString,
  massUnit: optionalString,
  density: numericString,
  densityUnit: optionalString,
  lengthOfDay: optionalString,
  lengthOfDayUnit: optionalString,
  surfaceGravity: numericString,
  surfaceGravityUnit: optionalString,
  escapeVelocity: optionalString,
  escapeVelocityUnit: optionalString,
  surfaceMinTemperature: optionalString,
  surfaceMeanTemperature: optionalString,
  surfaceMaxTemperature: optionalString,
  surfaceTemperatureUnit: optionalString,
  rings: z.union([rawRingsSchema, z.object({}).strict()]),
})

export const rawOrbitalPropsSchema = z.object({
  semiMajorAxis: z.string(),
  semiMajorAxisUnit: optionalString,
  orbitalEccentricity: z.string(),
  orbitalEccentricityUnit: optionalString,
  orbitalInclination: z.string(),
  orbitalInclinationUnit: optionalString,
  orbitalPeriod: z.string(),
  orbitalPeriodUnit: optionalString,
  longAscendingNode: z.string(),
  longAscendingNodeUnit: optionalString,
  argOfPerihelion: z.string(),
  argOfPerihelionUnit: optionalString,
  meanAnomaly: z.string(),
  meanAnomalyUnit: optionalString,
})

const rawBodyBaseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  textures: rawTexturesSchema,
  physicalProps: rawPhysicalPropsSchema,
  orbitalProps: rawOrbitalPropsSchema,
  rank: z.number().optional(),
  numberOfMoons: z.number().optional(),
  rotationDirection: z.enum(['prograde', 'retrograde']).optional(),
})

export const rawSatelliteSchema = rawBodyBaseSchema

export const rawPlanetSchema = rawBodyBaseSchema.extend({
  satellites: z.record(z.string(), rawSatelliteSchema).optional(),
})

export const rawSolarSystemSchema = z.object({
  sun: rawPlanetSchema,
  planets: z.record(z.string(), rawPlanetSchema),
})

export type RawTextures = z.infer<typeof rawTexturesSchema>
export type RawPhysicalProps = z.infer<typeof rawPhysicalPropsSchema>
export type RawOrbitalProps = z.infer<typeof rawOrbitalPropsSchema>
export type RawSatellite = z.infer<typeof rawSatelliteSchema>
export type RawPlanet = z.infer<typeof rawPlanetSchema>
export type RawSolarSystem = z.infer<typeof rawSolarSystemSchema>
