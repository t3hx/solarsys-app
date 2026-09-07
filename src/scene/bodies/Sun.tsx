/**
 * @module scene/bodies/Sun
 * @description L'etoile centrale : materiau non eclaire (MeshBasicMaterial) et source
 * de lumiere ponctuelle a l'origine. Pas d'ombres (decision du 2026-09-07).
 */
import { useRef } from 'react'
import type { Mesh } from 'three'
import { sunLightConfig } from '@/config/rendering'
import type { Body } from '@/data/model'
import { angularSpeedFromPeriodHours } from '@/physics/rotation'
import { starRadiusToUnits } from '@/physics/scaling'
import { axialTiltRotation, bodyScale, bodyUserData } from '@/scene/bodies/bodyTransform'
import { unitSphereGeometry } from '@/scene/bodies/geometry'
import { useColorTexture } from '@/scene/bodies/useColorTexture'
import { useBodyPointerHandlers } from '@/scene/interaction/useBodyPointerHandlers'
import { BodyHelpers } from '@/scene/debug/BodyHelpers'
import { useRegisterBody } from '@/scene/registry'
import { useDebugStore } from '@/store/debug'

export function Sun({ body }: { body: Body }) {
  const meshRef = useRef<Mesh>(null)
  const texture = useColorTexture(body.textures.main)
  const radius = starRadiusToUnits(body.radiusKm)
  useRegisterBody(body.id, meshRef, angularSpeedFromPeriodHours(body.rotationPeriodHours))
  const pointerHandlers = useBodyPointerHandlers(body.id)
  const wireframe = useDebugStore((state) => state.wireframe[body.id] ?? false)

  return (
    <mesh
      ref={meshRef}
      name={body.name}
      userData={bodyUserData(body)}
      geometry={unitSphereGeometry()}
      rotation={axialTiltRotation(body)}
      scale={bodyScale(body, radius)}
      {...pointerHandlers}
    >
      <meshBasicMaterial
        map={texture}
        wireframe={wireframe}
      />
      <pointLight
        color="white"
        intensity={sunLightConfig.intensity}
        decay={sunLightConfig.decay}
        distance={0}
      />
      <BodyHelpers bodyId={body.id} />
    </mesh>
  )
}
