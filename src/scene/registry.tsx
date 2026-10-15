/* eslint-disable react-refresh/only-export-components */
/**
 * @module scene/registry
 * @description Registre non reactif des objets Three.js de la scene : corps (mesh +
 * vitesse de rotation) et orbites (objet deplace + elements kepleriens mis a l'echelle),
 * plus l'horloge simulee. Fourni par contexte React depuis le canvas : jamais d'objet
 * Three dans un etat React ou Zustand, et chaque canvas (ou test) a son propre registre.
 *
 * Les fonctions `register*` renvoient un `unregister` qui ne retire que sa propre entree,
 * ce qui rend les effets idempotents sous le double montage de StrictMode.
 */
import type { ReactNode, RefObject } from 'react'
import { createContext, useContext, useEffect, useLayoutEffect } from 'react'
import type { Mesh, Object3D } from 'three'
import type { KeplerianOrbit } from '@/physics/kepler'
import { orbitalPosition } from '@/physics/kepler'

export interface BodyEntry {
  id: string
  mesh: Mesh
  /** Vitesse de rotation axiale en rad/jour simule (negative si retrograde) */
  rotationSpeed: number
}

export interface OrbitEntry {
  /** Id du corps qui orbite */
  id: string
  /** Objet translate sur l'orbite (le groupe "System" du corps) */
  mover: Object3D
  orbit: KeplerianOrbit
}

export interface SimulationClock {
  /** Temps simule ecoule, en jours */
  timeDays: number
}

export interface SceneRegistry {
  readonly clock: Readonly<SimulationClock>
  /** Avance l'horloge simulee et renvoie le nouveau temps en jours */
  advanceClock: (deltaDays: number) => number
  registerBody: (entry: BodyEntry) => () => void
  registerOrbit: (entry: OrbitEntry) => () => void
  getBody: (id: string) => BodyEntry | undefined
  getOrbit: (id: string) => OrbitEntry | undefined
  bodies: () => Iterable<BodyEntry>
  orbits: () => Iterable<OrbitEntry>
}

function registerIn<T extends { id: string }>(map: Map<string, T>, entry: T): () => void {
  map.set(entry.id, entry)
  return () => {
    if (map.get(entry.id) === entry) map.delete(entry.id)
  }
}

export function createRegistry(): SceneRegistry {
  const bodies = new Map<string, BodyEntry>()
  const orbits = new Map<string, OrbitEntry>()
  const clock: SimulationClock = { timeDays: 0 }
  return {
    clock,
    advanceClock: (deltaDays) => {
      clock.timeDays += deltaDays
      return clock.timeDays
    },
    registerBody: (entry) => registerIn(bodies, entry),
    registerOrbit: (entry) => registerIn(orbits, entry),
    getBody: (id) => bodies.get(id),
    getOrbit: (id) => orbits.get(id),
    bodies: () => bodies.values(),
    orbits: () => orbits.values(),
  }
}

const RegistryContext = createContext<SceneRegistry | null>(null)

export function RegistryProvider({
  registry,
  children,
}: {
  registry: SceneRegistry
  children: ReactNode
}) {
  return <RegistryContext.Provider value={registry}>{children}</RegistryContext.Provider>
}

export function useRegistry(): SceneRegistry {
  const registry = useContext(RegistryContext)
  if (!registry) throw new Error('useRegistry must be used inside a RegistryProvider')
  return registry
}

/** ~ Enregistre le mesh d'un corps une fois monte, et le retire au demontage. */
export function useRegisterBody(
  id: string,
  meshRef: RefObject<Mesh | null>,
  rotationSpeed: number,
): void {
  const registry = useRegistry()
  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return undefined
    return registry.registerBody({ id, mesh, rotationSpeed })
  }, [registry, id, meshRef, rotationSpeed])
}

/**
 * ~ Enregistre l'orbite d'un corps et place immediatement son groupe a la position
 * correspondant au temps simule courant (sinon il resterait a l'origine jusqu'a la
 * premiere frame, ou indefiniment en pause).
 */
export function useRegisterOrbit(
  id: string,
  moverRef: RefObject<Object3D | null>,
  orbit: KeplerianOrbit,
): void {
  const registry = useRegistry()
  useLayoutEffect(() => {
    const mover = moverRef.current
    if (!mover) return undefined
    const { x, z } = orbitalPosition(orbit, registry.clock.timeDays)
    mover.position.set(x, 0, z)
    return registry.registerOrbit({ id, mover, orbit })
  }, [registry, id, moverRef, orbit])
}
