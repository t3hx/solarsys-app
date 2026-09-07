/**
 * @module scene/orbits/OrbitingBody
 * @description Un corps en orbite et sa hierarchie, identique a la version Vue :
 *
 *   <group "X Orbital Plane" rotation.y = Ω>
 *     <group "X Orbit" rotation.x = i>
 *       <group "X System">              ← deplace le long de l'orbite par SimulationDriver
 *         <CelestialBody/>  + satellites (recursif, echelle locale)
 *       </group>
 *       <OrbitLine/>
 *     </group>
 *   </group>
 *
 * Les elements (i, Ω) sont convertis vers le plan de reference du corps central
 * (`referenceTilt`, inclinaison axiale du Soleil pour les planetes, 0 pour les satellites).
 */
import { useMemo, useRef } from 'react'
import type { Group } from 'three'
import type { Body } from '@/data/model'
import type { KeplerianOrbit } from '@/physics/kepler'
import { convertOrbitalElements } from '@/physics/orbitalElements'
import { bodyRadiusToUnits, effectiveOrbitRadius } from '@/physics/scaling'
import { CelestialBody } from '@/scene/bodies/CelestialBody'
import { OrbitLine } from '@/scene/orbits/OrbitLine'
import { useRegisterOrbit } from '@/scene/registry'

export interface OrbitingBodyProps {
  body: Body
  /** Rayon du corps central en unites de scene, ajoute au rayon orbital */
  centralRadiusUnits: number
  /** Inclinaison du plan de reference du corps central, en radians */
  referenceTilt: number
  /** Echelle locale (satellites) ou planetaire (UA) */
  local: boolean
}

export function OrbitingBody({
  body,
  centralRadiusUnits,
  referenceTilt,
  local,
}: OrbitingBodyProps) {
  const systemRef = useRef<Group>(null)
  const orbit = body.orbit

  const plane = useMemo(
    () =>
      orbit
        ? convertOrbitalElements(
            { inclination: orbit.inclination, longAscendingNode: orbit.longAscendingNode },
            referenceTilt,
          )
        : { inclination: 0, longAscendingNode: 0 },
    [orbit, referenceTilt],
  )

  const kepler = useMemo<KeplerianOrbit>(
    () => ({
      semiMajorAxis: orbit
        ? effectiveOrbitRadius(orbit.semiMajorAxisKm, centralRadiusUnits, { local })
        : 0,
      eccentricity: orbit?.eccentricity ?? 0,
      argOfPerihelion: orbit?.argOfPerihelion ?? 0,
      meanAnomalyAtEpoch: orbit?.meanAnomalyAtEpoch ?? 0,
      periodDays: orbit?.periodDays ?? 1,
    }),
    [orbit, centralRadiusUnits, local],
  )

  useRegisterOrbit(body.id, systemRef, kepler)

  const radiusUnits = bodyRadiusToUnits(body.radiusKm)

  return (
    <group
      name={`${body.name} Orbital Plane`}
      rotation-y={plane.longAscendingNode}
    >
      <group
        name={`${body.name} Orbit`}
        rotation-x={plane.inclination}
      >
        <group
          ref={systemRef}
          name={`${body.name} System`}
        >
          <CelestialBody body={body} />
          {body.satellites.map((satellite) => (
            <OrbitingBody
              key={satellite.id}
              body={satellite}
              centralRadiusUnits={radiusUnits}
              referenceTilt={0}
              local
            />
          ))}
        </group>
        <OrbitLine
          bodyId={body.id}
          name={`${body.name} Orbit Line`}
          semiMajorAxis={kepler.semiMajorAxis}
          eccentricity={kepler.eccentricity}
          argOfPerihelion={kepler.argOfPerihelion}
        />
      </group>
    </group>
  )
}
