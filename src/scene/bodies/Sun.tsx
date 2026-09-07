/**
 * @module scene/bodies/Sun
 * @description L'etoile centrale : materiau non eclaire (MeshBasicMaterial) et source
 * de lumiere ponctuelle a l'origine. Pas d'ombres (decision du 2026-09-07).
 */
import { useRef } from 'react'
import type { Mesh } from 'three'
import { sphereSegments, sunLightConfig } from '@/config/rendering'
import type { Body } from '@/data/model'
import { angularSpeedFromPeriodHours } from '@/physics/rotation'
import { starRadiusToUnits } from '@/physics/scaling'
import { axialTiltRotation, bodyUserData, oblatenessScale } from '@/scene/bodies/bodyTransform'
import { useColorTexture } from '@/scene/bodies/useColorTexture'
import { useBodyPointerHandlers } from '@/scene/interaction/useBodyPointerHandlers'
import { useRegisterBody } from '@/scene/registry'

export function Sun({ body }: { body: Body }) {
  const meshRef = useRef<Mesh>(null)
  const texture = useColorTexture(body.textures.main)
  const radius = starRadiusToUnits(body.radiusKm)
  useRegisterBody(body.id, meshRef, angularSpeedFromPeriodHours(body.rotationPeriodHours))
  const pointerHandlers = useBodyPointerHandlers(body.id)

  return (
    <mesh
      ref={meshRef}
      name={body.name}
      userData={bodyUserData(body)}
      rotation={axialTiltRotation(body)}
      scale={oblatenessScale(body)}
      {...pointerHandlers}
    >
      <sphereGeometry args={[radius, sphereSegments, sphereSegments]} />
      <meshBasicMaterial map={texture} />
      <pointLight
        color="white"
        intensity={sunLightConfig.intensity}
        decay={sunLightConfig.decay}
        distance={0}
      />
    </mesh>
  )
}
