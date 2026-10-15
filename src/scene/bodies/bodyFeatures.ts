/**
 * @module scene/bodies/bodyFeatures
 * @description Fonctionnalites visuelles d'un corps, deduites des textures et proprietes
 * declarees dans les donnees (jamais du nom du corps), et preset de materiau associe.
 */
import { materialDefaults } from '@/config/rendering'
import type { Body } from '@/data/model'

export interface BodyFeatures {
  /** Shader jour/nuit : textures day + night */
  dayNight: boolean
  /** Carte emissive des lumieres nocturnes : texture night */
  nightLights: boolean
  clouds: boolean
  atmosphere: boolean
  rings: boolean
  /** Carte speculaire convertie en carte de rugosite */
  specular: boolean
  normal: boolean
  bump: boolean
}

export function bodyFeatures(body: Body): BodyFeatures {
  const { textures } = body
  return {
    dayNight: Boolean(textures.day && textures.night),
    nightLights: Boolean(textures.night),
    clouds: Boolean(textures.clouds),
    atmosphere: Boolean(textures.atmosphere),
    rings: body.rings !== undefined,
    specular: Boolean(textures.specular),
    normal: Boolean(textures.normal),
    bump: Boolean(textures.bump),
  }
}

export type MaterialPreset = (typeof materialDefaults)[keyof typeof materialDefaults]

/** ~ Jour/nuit > atmosphere > preset du type de corps. */
export function materialPreset(body: Body): MaterialPreset {
  const features = bodyFeatures(body)
  if (features.dayNight) return materialDefaults.dayNight
  if (features.atmosphere) return materialDefaults.atmosphere
  return body.kind === 'satellite' ? materialDefaults.satellite : materialDefaults.planet
}
