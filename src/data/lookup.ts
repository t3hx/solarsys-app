/**
 * @module data/lookup
 * @description Acces aux corps du modele normalise : par id, liste plate, parent.
 */
import type { Body, SolarSystem } from '@/data/model'

export function findBody(system: SolarSystem, id: string): Body | undefined {
  return system.byId.get(id)
}

/** ~ Tous les corps, en profondeur d'abord : soleil, puis chaque planete suivie de ses satellites. */
export function allBodies(system: SolarSystem): Body[] {
  const bodies: Body[] = []
  const visit = (body: Body) => {
    bodies.push(body)
    body.satellites.forEach(visit)
  }
  visit(system.sun)
  system.planets.forEach(visit)
  return bodies
}

/** ~ Corps central autour duquel `id` orbite (aucun pour le Soleil et les planetes). */
export function parentOf(system: SolarSystem, id: string): Body | undefined {
  const body = findBody(system, id)
  if (!body?.parentId || body.kind !== 'satellite') return undefined
  return findBody(system, body.parentId)
}
