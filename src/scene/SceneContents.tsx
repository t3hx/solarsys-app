/**
 * @module scene/SceneContents
 * @description Contenu complet de la scene : eclairage ambiant, starfield, systeme
 * solaire, driver de simulation et camera.
 */
import { ambientLightConfig, starfieldConfig } from '@/config/scene'
import type { SolarSystem as SolarSystemModel } from '@/data/model'
import { CameraRig } from '@/scene/camera/CameraRig'
import { SceneReadyMarker } from '@/scene/SceneReadyMarker'
import { SimulationDriver } from '@/scene/simulation/SimulationDriver'
import { SolarSystem } from '@/scene/SolarSystem'
import { Starfield } from '@/scene/Starfield'

export function SceneContents({ system }: { system: SolarSystemModel }) {
  return (
    <>
      <ambientLight
        color={ambientLightConfig.color}
        intensity={ambientLightConfig.intensity}
      />
      <Starfield {...starfieldConfig} />
      <SolarSystem system={system} />
      <SimulationDriver />
      <CameraRig />
      <SceneReadyMarker />
    </>
  )
}
