/**
 * @module scene/SolarSystem
 * @description Graphe de scene du systeme solaire : le Soleil puis chaque planete (et
 * ses satellites) via `OrbitingBody`. Ne contient ni lumiere ambiante, ni starfield,
 * ni camera : voir `SceneContents`.
 */
import type { SolarSystem as SolarSystemModel } from '@/data/model'
import { starRadiusToUnits } from '@/physics/scaling'
import { Sun } from '@/scene/bodies/Sun'
import { OrbitingBody } from '@/scene/orbits/OrbitingBody'

export function SolarSystem({ system }: { system: SolarSystemModel }) {
  const sunRadius = starRadiusToUnits(system.sun.radiusKm)
  return (
    <>
      <Sun body={system.sun} />
      {system.planets.map((planet) => (
        <OrbitingBody
          key={planet.id}
          body={planet}
          centralRadiusUnits={sunRadius}
          referenceTilt={system.sun.axialTilt}
          local={false}
        />
      ))}
    </>
  )
}
