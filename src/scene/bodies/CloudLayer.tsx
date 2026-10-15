/**
 * @module scene/bodies/CloudLayer
 * @description Couche de nuages : sphere unitaire partagee legerement plus grande que le corps
 * (enfant du mesh, herite de son echelle), blanche, alpha depuis la texture.
 */
import type { Texture } from 'three'
import { cloudLayerDefaults, layerScaleFactors } from '@/config/rendering'
import { unitSphereGeometry } from '@/scene/bodies/geometry'

export function CloudLayer({
  name,
  texture,
  wireframe = false,
}: {
  name: string
  texture: Texture
  wireframe?: boolean
}) {
  return (
    <mesh
      name={name}
      geometry={unitSphereGeometry()}
      scale={layerScaleFactors.clouds}
    >
      <meshStandardMaterial
        alphaMap={texture}
        transparent
        wireframe={wireframe}
        opacity={cloudLayerDefaults.opacity}
      />
    </mesh>
  )
}
