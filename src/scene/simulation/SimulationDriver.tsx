/**
 * @module scene/simulation/SimulationDriver
 * @description Boucle de simulation : a chaque frame, avance l'horloge simulee
 * (delta en secondes × vitesse = jours), place chaque orbite enregistree via Kepler et
 * fait tourner chaque corps sur son axe. Aucune allocation dans la boucle, aucun hook
 * de store : l'etat est lu par `getState()`.
 */
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { frameOrder } from '@/config/scene'
import type { PlanePosition } from '@/physics/kepler'
import { orbitalPosition } from '@/physics/kepler'
import { useRegistry } from '@/scene/registry'
import { useSimulationStore } from '@/store/simulation'

export function SimulationDriver() {
  const registry = useRegistry()
  const scratch = useRef<PlanePosition>({ x: 0, z: 0 })

  useFrame((_, delta) => {
    const { speed, paused } = useSimulationStore.getState()
    if (paused) return

    const scaledDelta = delta * speed
    const time = registry.advanceClock(scaledDelta)

    for (const entry of registry.orbits()) {
      const position = orbitalPosition(entry.orbit, time, scratch.current)
      entry.mover.position.set(position.x, 0, position.z)
    }

    for (const entry of registry.bodies()) {
      if (entry.rotationSpeed !== 0) entry.mesh.rotation.y += entry.rotationSpeed * scaledDelta
    }
  }, frameOrder.simulation)

  return null
}
