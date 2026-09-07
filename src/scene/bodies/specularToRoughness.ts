/**
 * @module scene/bodies/specularToRoughness
 * @description Convertit les pixels d'une carte speculaire (brillance dans le canal vert) en
 * carte de rugosite : rugosite = 255 - brillance, plancher `minRoughness` pour limiter la
 * brillance de l'eau. La valeur est ecrite sur R, G et B ; l'alpha est conserve.
 */
import { specularProcessing } from '@/config/rendering'

export function specularToRoughness(data: Uint8ClampedArray): Uint8ClampedArray {
  for (let i = 0; i < data.length; i += 4) {
    const roughness = Math.max(255 - data[i + 1]!, specularProcessing.minRoughness)
    data[i] = roughness
    data[i + 1] = roughness
    data[i + 2] = roughness
  }
  return data
}
