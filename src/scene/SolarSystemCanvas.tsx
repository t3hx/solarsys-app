/**
 * @module scene/SolarSystemCanvas
 * @description Le `<Canvas>` React Three Fiber : renderer (antialias, ACES, exposition),
 * DPR plafonne, camera initiale, fond noir, pas d'ombres. Cree le registre de scene et
 * le fournit au contenu. Le contenu attend ses textures dans un Suspense.
 */
import { Canvas } from '@react-three/fiber'
import { Suspense, useMemo } from 'react'
import { ACESFilmicToneMapping } from 'three'
import { cameraConfig, rendererConfig } from '@/config/scene'
import type { SolarSystem } from '@/data/model'
import { createRegistry, RegistryProvider } from '@/scene/registry'
import { SceneContents } from '@/scene/SceneContents'

export function SolarSystemCanvas({ system }: { system: SolarSystem }) {
  const registry = useMemo(() => createRegistry(), [])

  return (
    <Canvas
      className="fixed inset-0"
      gl={{
        antialias: rendererConfig.antialias,
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: rendererConfig.toneMappingExposure,
      }}
      dpr={[1, rendererConfig.maxPixelRatio]}
      camera={{
        fov: cameraConfig.fov,
        near: cameraConfig.near,
        far: cameraConfig.far,
        position: [...cameraConfig.initialPosition],
      }}
      onCreated={({ gl }) => gl.setClearColor(rendererConfig.backgroundColor)}
    >
      <RegistryProvider registry={registry}>
        <Suspense fallback={null}>
          <SceneContents system={system} />
        </Suspense>
      </RegistryProvider>
    </Canvas>
  )
}
