/**
 * @module scene/labels/TacticalLabels
 * @description Traqueur des positions ecran pour les etiquettes tactiques : en vue
 * tactique, projette chaque frame la position monde des corps heliocentriques (mesh du
 * registre) en pixels ecran et l'ecrit dans `labelScreenPositions`. L'affichage est fait
 * cote HUD par `TacticalLabelsOverlay` ; ici aucun DOM et aucun etat React.
 */
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { Vector3 } from 'three'
import type { SolarSystem } from '@/data/model'
import { labelScreenPositions } from '@/scene/labels/labelScreenPositions'
import { useRegistry } from '@/scene/registry'
import { useInteractionStore } from '@/store/interaction'

const world = new Vector3()

export function TacticalLabels({ system }: { system: SolarSystem }) {
  const isTactical = useInteractionStore((state) => state.isTactical)
  const registry = useRegistry()
  const { width, height } = useThree((state) => state.size)

  useEffect(() => () => labelScreenPositions.clear(), [])

  useFrame(({ camera }) => {
    if (!isTactical) {
      if (labelScreenPositions.size > 0) labelScreenPositions.clear()
      return
    }
    for (const body of system.planets) {
      const mesh = registry.getBody(body.id)?.mesh
      if (!mesh) continue
      mesh.getWorldPosition(world).project(camera)
      labelScreenPositions.set(body.id, {
        x: ((world.x + 1) / 2) * width,
        y: ((1 - world.y) / 2) * height,
      })
    }
  })

  return null
}
