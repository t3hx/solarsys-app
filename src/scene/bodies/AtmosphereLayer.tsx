/**
 * @module scene/bodies/AtmosphereLayer
 * @description Couche d'atmosphere semi-transparente texturee, 1 % au-dessus de la surface.
 */
import type { Texture } from 'three'
import { atmosphereLayerDefaults, layerScaleFactors, materialDefaults } from '@/config/rendering'
import { unitSphereGeometry } from '@/scene/bodies/geometry'

export function AtmosphereLayer({ name, texture }: { name: string; texture: Texture }) {
  return (
    <mesh
      name={name}
      geometry={unitSphereGeometry()}
      scale={layerScaleFactors.atmosphere}
    >
      <meshStandardMaterial
        map={texture}
        transparent
        opacity={atmosphereLayerDefaults.opacity}
        roughness={materialDefaults.atmosphere.roughness}
        metalness={materialDefaults.atmosphere.metalness}
      />
    </mesh>
  )
}
