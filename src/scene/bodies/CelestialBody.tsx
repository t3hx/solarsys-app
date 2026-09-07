/**
 * @module scene/bodies/CelestialBody
 * @description Planete ou satellite, entierement guide par les donnees : les cartes et les
 * couches s'activent selon les textures declarees (voir `bodyFeatures`).
 *
 * - sphere unitaire partagee, rayon en scale, aplatissement en scale Y, inclinaison axiale ;
 * - materiau : surface, normale, relief, rugosite depuis la speculaire, emissif nocturne,
 *   preset (jour/nuit > atmosphere > type), shader jour/nuit par `onBeforeCompile` ;
 * - enfants : nuages, atmosphere, anneaux (heritent de l'echelle et de l'inclinaison).
 */
import { useRef } from 'react'
import type { Mesh } from 'three'
import type { Body } from '@/data/model'
import { angularSpeedFromPeriodHours } from '@/physics/rotation'
import { bodyRadiusToUnits } from '@/physics/scaling'
import { AtmosphereLayer } from '@/scene/bodies/AtmosphereLayer'
import { bodyFeatures, materialPreset } from '@/scene/bodies/bodyFeatures'
import { axialTiltRotation, bodyScale, bodyUserData } from '@/scene/bodies/bodyTransform'
import { CloudLayer } from '@/scene/bodies/CloudLayer'
import { injectDayNightShader } from '@/scene/bodies/dayNightShader'
import { unitSphereGeometry } from '@/scene/bodies/geometry'
import { RingLayer } from '@/scene/bodies/RingLayer'
import { useBodyTextures } from '@/scene/bodies/useBodyTextures'
import { useRoughnessMap } from '@/scene/bodies/useRoughnessMap'
import { BodyHelpers } from '@/scene/debug/BodyHelpers'
import { useBodyPointerHandlers } from '@/scene/interaction/useBodyPointerHandlers'
import { useRegisterBody } from '@/scene/registry'
import { useDebugStore } from '@/store/debug'

export function CelestialBody({ body }: { body: Body }) {
  const meshRef = useRef<Mesh>(null)
  const features = bodyFeatures(body)
  const preset = materialPreset(body)
  const textures = useBodyTextures(body)
  const roughnessMap = useRoughnessMap(textures.specular)
  const wireframe = useDebugStore((state) => state.wireframe[body.id] ?? false)

  useRegisterBody(body.id, meshRef, angularSpeedFromPeriodHours(body.rotationPeriodHours))
  const pointerHandlers = useBodyPointerHandlers(body.id)

  const emissiveIntensity = 'emissiveIntensity' in preset ? preset.emissiveIntensity : 1
  const dayNightShader = features.dayNight ? { onBeforeCompile: injectDayNightShader } : {}

  return (
    <mesh
      ref={meshRef}
      name={body.name}
      userData={bodyUserData(body)}
      geometry={unitSphereGeometry()}
      rotation={axialTiltRotation(body)}
      scale={bodyScale(body, bodyRadiusToUnits(body.radiusKm))}
      {...pointerHandlers}
    >
      <meshStandardMaterial
        map={textures.main ?? null}
        normalMap={textures.normal ?? null}
        bumpMap={textures.bump ?? null}
        roughnessMap={roughnessMap ?? null}
        emissiveMap={textures.night ?? null}
        emissive={features.nightLights ? 'white' : 'black'}
        emissiveIntensity={emissiveIntensity}
        roughness={preset.roughness}
        metalness={preset.metalness}
        wireframe={wireframe}
        {...dayNightShader}
      />
      {features.clouds && textures.clouds && (
        <CloudLayer
          name={`${body.name}Clouds`}
          texture={textures.clouds}
          wireframe={wireframe}
        />
      )}
      {features.atmosphere && textures.atmosphere && (
        <AtmosphereLayer
          name={`${body.name}Atmosphere`}
          texture={textures.atmosphere}
          wireframe={wireframe}
        />
      )}
      {features.rings && (
        <RingLayer
          body={body}
          texture={textures.rings}
          wireframe={wireframe}
        />
      )}
      <BodyHelpers bodyId={body.id} />
    </mesh>
  )
}
