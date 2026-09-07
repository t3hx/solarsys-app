/**
 * @module scene/bodies/CelestialBody
 * @description Planete ou satellite : sphere a l'echelle du projet, texture principale,
 * preset de materiau selon le type, aplatissement et inclinaison axiale.
 * Les couches (nuages, atmosphere, anneaux) et le shader jour/nuit arrivent en phase 5.
 */
import { useRef } from 'react'
import type { Mesh } from 'three'
import { materialDefaults, sphereSegments } from '@/config/rendering'
import type { Body } from '@/data/model'
import { angularSpeedFromPeriodHours } from '@/physics/rotation'
import { bodyRadiusToUnits } from '@/physics/scaling'
import { axialTiltRotation, bodyUserData, oblatenessScale } from '@/scene/bodies/bodyTransform'
import { useColorTexture } from '@/scene/bodies/useColorTexture'
import { useBodyPointerHandlers } from '@/scene/interaction/useBodyPointerHandlers'
import { useRegisterBody } from '@/scene/registry'

export function CelestialBody({ body }: { body: Body }) {
  const meshRef = useRef<Mesh>(null)
  const texture = useColorTexture(body.textures.main)
  const radius = bodyRadiusToUnits(body.radiusKm)
  const preset = body.kind === 'satellite' ? materialDefaults.satellite : materialDefaults.planet
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
      <meshStandardMaterial
        map={texture}
        roughness={preset.roughness}
        metalness={preset.metalness}
      />
    </mesh>
  )
}
