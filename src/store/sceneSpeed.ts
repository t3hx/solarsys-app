/**
 * @module store/sceneSpeed
 * @description Vitesse de simulation par defaut selon le type de scene : lente en focus
 * (une heure par seconde, pour contempler la rotation), un jour par seconde en vue univers
 * (la course des planetes reste visible), une annee par seconde en vue tactique (les
 * differences de vitesse orbitale sautent aux yeux). Appliquee a chaque changement de
 * scene ; l'utilisateur garde la main entre deux changements.
 */
import { useInteractionStore } from '@/store/interaction'
import type { TimeScaleId } from '@/store/simulation'
import { presetSpeed, useSimulationStore } from '@/store/simulation'

export type SceneKind = 'focus' | 'universe' | 'tactical'

const defaultPreset: Record<SceneKind, TimeScaleId> = {
  focus: 'hour',
  universe: 'day',
  tactical: 'year',
}

export function sceneKindOf(state: { selectedId: string | null; isTactical: boolean }): SceneKind {
  if (state.isTactical) return 'tactical'
  return state.selectedId === null ? 'universe' : 'focus'
}

export function defaultSpeedFor(kind: SceneKind): number {
  return presetSpeed(defaultPreset[kind])
}

/** ~ Applique la vitesse par defaut a chaque changement de scene ; renvoie la desinscription. */
export function bindSceneSpeedDefaults(): () => void {
  let previous = sceneKindOf(useInteractionStore.getState())
  let previousSelection = useInteractionStore.getState().selectedId
  return useInteractionStore.subscribe((state) => {
    const kind = sceneKindOf(state)
    // * Passer d'un corps a un autre est aussi un changement de scene (nouveau focus)
    const selectionChanged = kind === 'focus' && state.selectedId !== previousSelection
    if (kind !== previous || selectionChanged) {
      useSimulationStore.getState().setSpeed(defaultSpeedFor(kind))
    }
    previous = kind
    previousSelection = state.selectedId
  })
}
