/**
 * @module data/loadSolarSystem
 * @description Chargement du JSON, validation (zod) et normalisation en une seule etape.
 */
import type { SolarSystem } from '@/data/model'
import { normalizeSolarSystem } from '@/data/normalize'
import { rawSolarSystemSchema } from '@/data/schema'

export const SOLAR_SYSTEM_DATA_URL = '/data/solar_system_data.json'

export interface LoadSolarSystemOptions {
  url?: string
  fetchImpl?: typeof fetch
}

export async function loadSolarSystem(options: LoadSolarSystemOptions = {}): Promise<SolarSystem> {
  const url = options.url ?? SOLAR_SYSTEM_DATA_URL
  const fetchImpl = options.fetchImpl ?? fetch
  const response = await fetchImpl(url)
  if (!response.ok) {
    throw new Error(`Failed to load solar system data: ${response.status} ${response.statusText}`)
  }
  const raw = rawSolarSystemSchema.parse(await response.json())
  return normalizeSolarSystem(raw)
}
