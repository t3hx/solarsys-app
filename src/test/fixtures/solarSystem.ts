import rawData from '../../../public/data/solar_system_data.json'
import { normalizeSolarSystem } from '@/data/normalize'
import { rawSolarSystemSchema } from '@/data/schema'

/** ~ Systeme solaire normalise a partir du JSON livre, partage par les tests. */
export const solarSystemFixture = normalizeSolarSystem(rawSolarSystemSchema.parse(rawData))
