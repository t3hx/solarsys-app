/**
 * @module scene/bodies/RingLayer
 * @description Anneaux planetaires : geometrie annulaire en unites de rayon du corps (enfant du
 * mesh, herite de son echelle et de son inclinaison), texture en bande radiale si disponible,
 * sinon couleur unie attenuee (Uranus). Visible des deux cotes.
 */
import { useEffect, useMemo } from 'react'
import type { Texture } from 'three'
import { DoubleSide } from 'three'
import { ringLayerDefaults } from '@/config/rendering'
import type { Body } from '@/data/model'
import { createRingGeometry } from '@/scene/bodies/ringGeometry'

export function RingLayer({ body, texture }: { body: Body; texture: Texture | undefined }) {
  const rings = body.rings!
  const inner = rings.innerRadiusKm / body.radiusKm
  const outer = rings.outerRadiusKm / body.radiusKm

  const geometry = useMemo(
    () => createRingGeometry(inner, outer, ringLayerDefaults.thetaSegments),
    [inner, outer],
  )
  useEffect(() => () => geometry.dispose(), [geometry])

  const material = texture ? ringLayerDefaults.textured : ringLayerDefaults.fallback

  return (
    <mesh
      name={`${body.name}Rings`}
      geometry={geometry}
    >
      <meshStandardMaterial
        map={texture ?? null}
        color={texture ? 'white' : ringLayerDefaults.fallbackColor}
        side={DoubleSide}
        transparent
        opacity={material.opacity}
        roughness={material.roughness}
        metalness={material.metalness}
      />
    </mesh>
  )
}
